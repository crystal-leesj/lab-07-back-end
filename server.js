'use strict';

const PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');
// const superagent = require('superagent');

const app = express();
require('dotenv').config();

app.use(cors());

app.get('/', (request,response) => {
  response.send('Home Page is running!');
});

app.get('/location', (request,response) => {
  try {
    const locationData = getLatLong(request.query.data);
    response.send(locationData);
  }
  catch(error) {
    console.error(error);
    response.status(500).send('Status 500: Internal Server Error');
  }
});

app.get('/weather', (request,response) => {
  try {
    const weatherQuery = getWeather();
    console.log('weatherQuery :', weatherQuery);
    response.send(weatherQuery);
  }
  catch(error) {
    console.error(error);
    response.status(500).send('Status 500: Internal Server Error');
  }
});

function getLatLong(location) {
  const geoData = require('./data/geo.json');
  const locationData = {
    search_query: location,
    formatted_query: geoData.results[0].formatted_address,
    latitude: geoData.results[0].geometry.location.lat,
    longitude: geoData.results[0].geometry.location.lng,
  }
  console.log('locationData :', locationData);
  return locationData;
}

function getWeather() {
  const weatherForcast = require('./data/darksky.json');
  let weatherDetails = [];
  weatherForcast.daily.data.forEach(weatherObj => weatherDetails.push(new Weather(weatherObj)));

  return weatherDetails;
}

function Weather(weatherObj) {
  this.forecast = weatherObj.summary,
  this.time = new Date(weatherObj.time * 1000).toDateString();
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

