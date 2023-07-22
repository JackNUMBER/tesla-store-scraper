const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

const RADIUS_IN_METERS = 200;
const OPTIONS = { steps: 10, units: 'meters' };

const inputScrapFilePath = path.join(__dirname, 'output/tesla_stores.geojson');
const inputOverpassFilePath = path.join(__dirname, 'overpass-export.geojson');

const scrapedData = JSON.parse(fs.readFileSync(inputScrapFilePath));
const osmData = JSON.parse(fs.readFileSync(inputOverpassFilePath));

let storesProbablyInOsm = [];
let storesProbablyNotInOsm = [];

for (const scrapedFeature of scrapedData.features) {
  let isIntersect = false;
  const point = turf.point(scrapedFeature.geometry.coordinates);
  const circle = turf.circle(point, RADIUS_IN_METERS, OPTIONS);

  for (const osmFeature of osmData.features) {
    const challengerPoint = turf.point(osmFeature.geometry.coordinates);
    isIntersect = turf.booleanPointInPolygon(challengerPoint, circle);

    if (isIntersect) break;
  }

  if (isIntersect) {
    storesProbablyInOsm.push(scrapedFeature);
  } else {
    storesProbablyNotInOsm.push(scrapedFeature);
  }
}

console.log('storesProbablyInOsm', storesProbablyInOsm.length);
console.log('storesProbablyNotInOsm', storesProbablyNotInOsm.length);
console.log(
  'total',
  storesProbablyInOsm.length + storesProbablyNotInOsm.length,
);
console.log('scraped', scrapedData.features.length);
