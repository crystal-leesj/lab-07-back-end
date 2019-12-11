'use strict';

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const superagent = require('superagent');
const cors = require('cors');

app.use(cors());

function Location(city, geoData){
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

function Weather(forecast, time){
  this.forecast = forecast;
  this.time = time;
}

function Event(link, name, date, summary){
  this.link = link;
  this.name = name;
  this.event_date = date;
  this.summary = summary;
}

function getLocation(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url).then(data => {
    const geoData = data.body;
    // console.log('*****geoData :', geoData);
    const city = request.query.data;
    const locationData = new Location(city, geoData);
    // console.log('*****locationData :', locationData);
    response.status(200).send(locationData);
  }).catch(err => {
    console.error(err);
    response.status(500).send('Status 500: Internal Server Error');
  });
}

function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  superagent.get(url).then(data => {
    // console.log('WeatherDATA : ', data.body.daily.data);
    const weatherData = data.body.daily.data.map(obj => {
      let forecast = obj.summary;
      let formattedTime = new Date(obj.time * 1000).toDateString();
      return new Weather(forecast, formattedTime);
    })
    response.status(200).send(weatherData);
  }).catch(err => {
    console.error(err);
    response.status(500).send('Status 500: Internal Server Error');
  });
}

function getEventBrite(request, response) {
  const url = `http://api.eventful.com/json/events/search?location=${request.query.data.formatted_query}&app_key=${process.env.EVENTBRITE_API_KEY}`;
  superagent.get(url).then(data => {
    const eventData = JSON.parse(data.text);
    const eventDataEvetn = eventData.events.event[0];
    console.log('****eventDataEvetn ', eventDataEvetn);
    console.log('%%%%%%LINK :', eventDataEvetn.url);

    const events = eventDataEvetn.map(obj => {
      const link = obj.url;
      const name = obj.name.text;
      const date = new Date(obj.start.local).toDateString();
      const summary = obj.description.text;
      return new Event(link, name, date, summary);
    })
    console.log('events :', events);
    response.status(200).send(events);
  }).catch(err => {
    console.error(err);
    response.status(500).send('Status 500: Internal Server Error');
  })
}

app.get('/', (request,response) => {
  response.send('Home Page is running!');
});

app.get('/location', getLocation);

app.get('/weather', getWeather);

app.get('/events', getEventBrite);

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

