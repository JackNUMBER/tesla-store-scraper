const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://www.tesla.com';
const startUrl = 'https://www.tesla.com/findus/list';

const outputFilePath = path.join(__dirname, 'output/tesla_stores.json');
const stream = fs.createWriteStream(outputFilePath);

function unique(value, index, array) {
  return array.indexOf(value) === index;
}

function extractCoordinatesFromMapImageSrcUrl(url) {
  const urlObject = new URL(url);
  const searchParams = urlObject.searchParams;
  const daddr = searchParams.get('center');
  const coordinates = daddr.split(',');
  return {
    latitude: coordinates[0],
    longitude: coordinates[1],
  };
}

function extractHoursFromParagraph(paragraph, cheerio) {
  const output = {};
  const $ = cheerio;
  const lines = paragraph.contents().filter(function () {
    return this.nodeType === 3; // keep only text nodes
  });

  lines.each((index, element) => {
    if (index > 0) {
      // ignore first line "Store Hours"
      const text = $(element).text().trim();
      const parts = text.split(' ');
      const key = parts.shift().toLowerCase();
      const value = parts.join(' ');
      output[key] = value;
    }
  });

  return output;
}

function writeInFile(content) {
  stream.write(content, (err) => {
    if (err) {
      console.error(
        "Une erreur s'est produite lors de l'écriture du fichier JSON :",
        err,
      );
    }
  });
}

// get data from final store page
async function scrapStorePage(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const main = $('.find-us-list-main');

    const name = $(main).find('.findus-list-header h1').text().trim();
    console.log(' ▶ ', name);
    const commonName = $(main).find('.common-name').text().trim();
    const address = $(main).find('.street-address').text().trim();
    const extendedAddress = $(main).find('.extended-address').text().trim();
    const city = $(main).find('.locality').text().trim();

    // contact
    const phone = $(main)
      .find('.tel .type:contains("Store")')
      .next()
      .text()
      .trim();

    let email = $(main).find('a[href^="mailto:"]').attr('href');
    if (email) {
      email = email.replace('mailto:', '');
    }

    // coordinates from location preview image
    const mapImageSrc = $(main).find('#location-map img').attr('src').trim();
    const coordinates = extractCoordinatesFromMapImageSrcUrl(mapImageSrc);

    // services
    const storeType = $(main).find('.type-store').text().trim();
    const hasRepearCenter = $(main).find('.type-service') ? 'yes' : 'no';
    const listServices = $('.find-us-details-types li');
    const services = {};
    listServices.each((_index, element) => {
      const className = $(element).attr('class');
      const text = $(element).text().trim();
      services[className] = text;
    });

    // hours
    const storeHoursParagpraph = $(main).find('p:contains("Store Hours")');
    const storeHours = extractHoursFromParagraph(storeHoursParagpraph, $);

    const serviceHoursParagpraph = $(main).find('p:contains("Service Hours")');
    const serviceHours = extractHoursFromParagraph(serviceHoursParagpraph, $);

    return {
      name,
      commonName,
      address,
      extendedAddress,
      city,
      phone,
      email,
      coordinates,
      storeType,
      hasRepearCenter,
      services,
      storeHours,
      serviceHours,
    };
  } catch (error) {
    console.error(
      `Une erreur s'est produite lors de la récupération des données de ${url} :`,
      error,
    );
    return {};
  }
}

// get store list from country page
async function scrapCountryStoreList(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const storeUrls = [];

    $('.find-us-list-state .vcard a').each((_index, element) => {
      const storeLink = $(element).attr('href');
      const absoluteUrl = new URL(storeLink, baseUrl).href;
      storeUrls.push(absoluteUrl);
    });

    const storeUrlsClean = storeUrls.filter(unique);

    return storeUrlsClean;
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la récupération des liens des magasins :",
      error,
    );
    return [];
  }
}

// get country list from Find Us page
async function scrapCountries(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const countries = [];

    $('.find-us-list-main > section:first-of-type .list-container a').each(
      (_index, element) => {
        const countryName = $(element).find('span').text();
        const countryLink = $(element).attr('href');
        const absoluteUrl = new URL(countryLink, baseUrl).href;
        countries.push({ name: countryName, url: absoluteUrl });
      },
    );

    return countries;
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la récupération des liens des pays :",
      error,
    );
    return [];
  }
}

async function scrap(url) {
  try {
    const urls = await scrapCountries(url);
    /*
    // Item sample:
    {
      name: 'New Zealand',
      url: 'https://www.tesla.com/findus/list/stores/New+Zealand',
      storeUrls: [
        'https://www.tesla.com/findus/location/store/TeslaCentreAucklandSouth',
        'https://www.tesla.com/findus/location/store/aucklandponsonby',
        'https://www.tesla.com/findus/location/store/teslachristchurch15pilkingtonway',
        'https://www.tesla.com/findus/location/store/wellingtonngauranga'
      ]
    }
    */

    console.log(`\x1b[33mGet stores urls from...\x1b[0m`);
    for (const country of urls) {
      console.log(country.name);
      country.storeUrls = await scrapCountryStoreList(country.url);
    }

    console.log(`\n\x1b[33mGet stores informations...\x1b[0m`);
    writeInFile('[\n');

    for (const country of urls) {
      console.log(`\x1b[34m${country.name}\x1b[0m`);
      for (const url of country.storeUrls) {
        const storeData = await scrapStorePage(url);
        writeInFile(JSON.stringify(storeData, null, 2) + ',\n');
      }
    }

    writeInFile(']');
  } catch (error) {
    console.error("Une erreur s'est produite lors du scraping :", error);
    return [];
  }
}

scrap(startUrl)
  .then(() => {
    console.log('\x1b[32m \n\n✔ Terminé\n\n \x1b[0m');
    stream.end();
  })
  .catch((error) => {
    console.error(
      "Une erreur s'est produite lors de l'exécution du script :",
      error,
    );
  });
