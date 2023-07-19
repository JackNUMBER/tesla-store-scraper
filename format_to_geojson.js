const fs = require('fs');
const path = require('path');

const inputFilePath = path.join(__dirname, 'output/tesla_stores.json');
const outputFilePath = path.join(__dirname, 'output/geojson.json');

// Lire le fichier JSON
fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(
      "Une erreur s'est produite lors de la lecture du fichier JSON :",
      err,
    );
    return;
  }

  try {
    const locations = JSON.parse(data); // Convertir le contenu JSON en tableau d'objets

    // Transformer chaque objet en GeoJSON
    const geojsonFeatures = locations.map((location) => {
      const {
        name,
        commonName,
        address,
        extendedAddress,
        city,
        phone,
        email,
        storeType,
        hasRepearCenter,
        services,
        storeHours,
        serviceHours,
        coordinates,
      } = location;

      const feature = {
        type: 'Feature',
        properties: {
          name,
          commonName,
          address,
          extendedAddress,
          city,
          phone,
          email,
          storeType,
          hasRepearCenter,
          services,
          storeHours,
          serviceHours,
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(coordinates.longitude),
            parseFloat(coordinates.latitude),
          ],
        },
      };

      return feature;
    });

    const geojson = {
      type: 'FeatureCollection',
      name: 'Tesla Stores',
      features: geojsonFeatures,
    };

    const outputData = JSON.stringify(geojson, null, 2);

    fs.writeFile(outputFilePath, outputData, (err) => {
      if (err) {
        console.error(
          "Une erreur s'est produite lors de l'écriture du fichier GeoJSON :",
          err,
        );
      } else {
        console.log(
          `Le fichier GeoJSON a été enregistré avec succès : ${outputFilePath}`,
        );
      }
    });
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la transformation en GeoJSON :",
      error,
    );
  }
});
