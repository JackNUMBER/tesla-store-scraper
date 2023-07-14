## Init

Install dependencies with:

```
npm install
```

## Run

Start the script with:

```
npm run start
```

The data will writed in stream in the `output` folder.

Here a sample of output data:

```
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

## Known issues

At the moment, output JSON is not well formated because it ends by `},]` instead of `}]`.
In the same way, if you stop the script during processing, the final `]` will not be added.

I know it's not ideal, but hey! the time it takes to solve it with code is much longer than the time it takes to fix it by hand a hundred times.

---

🇫🇷 Error messages are in french.
