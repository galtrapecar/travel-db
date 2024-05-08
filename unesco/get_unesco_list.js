require("dotenv").config();
const fs = require("fs");
const { default: axios } = require("axios");
const pg = require("pg");
const format = require("pg-format");
const parseString = require("xml2js").parseString;
const imageUrls = require("./image_urls_backup.json");

const pgdatabase = "geoinfo";
delete process.env.PGDATABASE;

const writeToPostgres = async (data) => {
  const { Client } = pg;
  {
    const client = new Client({
      database: pgdatabase,
    });
    await client.connect();
    try {
      await client.query(
        format(
          "INSERT INTO unesco (id, name, category, url, image_url, iso2, lat, lng, description) VALUES %L",
          [...data]
        )
      );
    } catch (err) {
      console.error("Error while inserting data: ", err);
    } finally {
      await client.end();
    }
  }
};

const fetchXML = async () => {
  const text = fs.readFileSync("unesco.xml");
  parseString(text, (_, result) => {
    let items = [];
    const rows = result.query.row;
    rows.forEach(async (row, i) => {
      const item = {
        id: parseInt(row.id_number[0]),
        name: row.site[0],
        category: row.category[0],
        url: row.http_url[0],
        image_url: imageUrls[i],
        iso2: `{ ${row.iso_code[0]
          .toUpperCase()
          .split(",")
          .map((i) => `"${i}"`)
          .join(", ")} }`,
        lat: parseFloat(row.latitude[0]),
        lng: parseFloat(row.longitude[0]),
        description: row.short_description[0],
      };
      items.push(item);
    });
    writeToPostgres(items.map((item) => Object.values(item)));
  });
};

fetchXML();
