const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

const RADIUS_IN_METERS = 200;
const OPTIONS = { steps: 10, units: 'meters' };

const inputScrapFilePath = path.join(__dirname, 'output/tesla_stores.geojson');
const inputOverpassFilePath = path.join(__dirname, 'overpass-export.geojson');
const outputInOsmFilePath = path.join(
  __dirname,
  'output/tesla_stores_in_osm.geojson',
);
const outputNotInOsmFilePath = path.join(
  __dirname,
  'output/tesla_stores_not_in_osm.geojson',
);

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

const hasError = false;

const geojsonProbablyInOsm = {
  type: 'FeatureCollection',
  name: 'Tesla Stores already in OSM',
  features: storesProbablyInOsm,
};

fs.writeFile(
  outputInOsmFilePath,
  JSON.stringify(geojsonProbablyInOsm, null, 2),
  (error) => {
    if (error) {
      console.error(
        'Une erreur s\'est produite lors de l\'écriture du fichier "In OSM" :',
        error,
      );
    }
  },
);

const geojsonProbablyNotInOsm = {
  type: 'FeatureCollection',
  name: 'Tesla Stores NOT in OSM',
  features: storesProbablyNotInOsm,
};

fs.writeFile(
  outputNotInOsmFilePath,
  JSON.stringify(geojsonProbablyNotInOsm, null, 2),
  (error) => {
    if (error) {
      console.error(
        'Une erreur s\'est produite lors de l\'écriture du fichier "Not In OSM" :',
        error,
      );
    }
  },
);

if (!hasError) {
  console.log('\x1b[32m \n\n✔ Terminé\n\n \x1b[0m');
}
