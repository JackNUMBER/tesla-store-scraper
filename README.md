This repo purpose is about getting Tesla stores data and prepare data to create a **[Maproulette](https://maproulette.org/) challenge**. The final purpose is to add this data in **OpenStreetMap**.

It contains 👨‍💻 **recursive scraping** and 🌍 **geospatial data analysis**. All in Nodejs.

Summary:

1. [Init](#init)
2. [Scrap data](#scrap-data)
3. [Format data](#format-data)
4. [Analysis data](#analysis-data)

## Init

Install dependencies with:

```
npm install
```

## Scrap data

Start the data script with:

```
npm run scrap
```

The data will be written in stream in the `output/tesla_stores.json` file.

Here a sample of output data:

```json
{
  "name": "Cannes-Mandelieu",
  "commonName": "Cannes-Mandelieu",
  "address": "Avenue du Marechal de Lattre de Tassigny",
  "extendedAddress": "Tesla Mandelieu",
  "city": "06210 Mandelieu-la-NapouleFrance",
  "phone": "+33423110178",
  "email": "riviera_sales@tesla.com",
  "coordinates": {
    "latitude": "43.5495466",
    "longitude": "6.9446249"
  },
  "storeType": "Stores and Galleries",
  "hasRepearCenter": "yes",
  "services": {
    "type-store": "Stores and Galleries",
    "type-service": "Service Center"
  },
  "storeHours": {
    "tuesday": "10:00am - 6:00pm",
    "wednesday": "10:00am - 6:00pm",
    "thursday": "10:00am - 6:00pm",
    "friday": "10:00am - 6:00pm",
    "saturday": "10:00am - 6:00pm",
    "sunday": "closed"
  },
  "serviceHours": {
    "tuesday": "8:30am - 6:30pm",
    "wednesday": "8:30am - 6:30pm",
    "thursday": "8:30am - 6:30pm",
    "friday": "8:30am - 6:30pm",
    "saturday": "closed",
    "sunday": "closed"
  }
},
```

### Known issues

At the moment, output JSON is not well formated because it ends by `},]` instead of `}]`.
In the same way, if you stop the script during processing, the final `]` will not be added.

I know it's not ideal, but hey! the time it takes to solve it with code is much longer than the time it takes to fix it by hand a hundred times.

## Format data

Convert data to geojson with:

```
npm run format
```

The opening hours will be converted to [OSM specification](https://wiki.openstreetmap.org/wiki/Key:opening_hours).\
The data will be written in the `output/tesla_stores.geojson` file.

Here a sample of output data:

```json
{
  "type": "Feature",
  "properties": {
    "name": "Cannes-Mandelieu",
    "commonName": "Cannes-Mandelieu",
    "address": "Avenue du Marechal de Lattre de Tassigny",
    "extendedAddress": "Tesla Mandelieu",
    "city": "06210 Mandelieu-la-NapouleFrance",
    "phone": "+33423110178",
    "email": "riviera_sales@tesla.com",
    "storeType": "Stores and Galleries",
    "hasRepearCenter": "yes",
    "services": {
      "type-store": "Stores and Galleries",
      "type-service": "Service Center"
    },
    "storeHours": "Tu-Sa 10:00-18:00; Su off",
    "serviceHours": "Tu-Fr 08:30-18:30; Sa-Su off"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [
      6.9446249,
      43.5495466
    ]
  }
},
```

## Analysis data

The best part. ✨
Datas will be compared with existing OpenStreetMap data (see [OSM extract](#osm-extract)). The script will separate stores already in OSM from those that are not.

```
npm run analyse
```

The data will be written in the `output/tesla_stores_in_osm.json` and `output/tesla_stores_not_in_osm.json` files.

### OSM extract

- Extract data from OpenStreetMap with this request (you can use [Overpass Turbo](https://overpass-turbo.eu/))
  ```c
  [out:json];
  node["shop"="car"]["brand"="Tesla"];
  way["shop"="car"]["brand"="Tesla"];
  out geom;
  ```
- Export the data in GeoJSON to a file named `overpass-export.geojson`, place it in this project's root
- Then you can run the `analyse` command

Everything is ready to create the Maproulette challenge 😀

---

🇫🇷 Error messages are in french.
