'use strict';

const PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const app = express();
require('dotenv').config();

app.use(cors());

app.get('/', (request,response) => {
  response.send('Home Page is running!');
});

app.get('/location', (request,response) => {
  const locationName = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url).then(data => {
    const geoData = data.body;
    const city = request.query.data;
    const locationData = new Location(city, geoData);
    response.status(200).send(locationData);
  }).catch(err => {
    console.error(err);
    response.status(500).send('Status 500: Internal Server Error')
  });
});


function Location(city, geoData){
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

