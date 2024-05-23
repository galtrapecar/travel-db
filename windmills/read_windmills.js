require("dotenv").config();
const fs = require("fs");
const pg = require("pg");
const format = require("pg-format");

const writeToPostgres = async (data) => {
  const pgdatabase = 'geoinfo';
  delete process.env.PGDATABASE;

  const { Client } = pg;

  {
    const client = new Client({
      database: pgdatabase,
    });
    await client.connect();
    try {
      await client.query(
        format(
          "INSERT INTO windmills (id, windmill, windmill_ascii, lat, lng, iso2, location) VALUES %L",
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

fs.readFile("windmills.txt", "utf-8", (err, data) => {
  if (err) {
    console.log("Error while reading windmills.txt:", err);
    return;
  }

  const lines = data.split(/\r?\n/);
  if (lines.at(-1) === "") lines.pop();

  const referenceArray = ['id', 'windmill', 'windmill_ascii', '', 'lat', 'lng', '', '', 'iso2', '', '', '', '', '', '', '', '', 'location', ''];

  const parsedData = [];

  lines.forEach((line) => {
    const items = line.split('\t');
    const dataRow = []
    referenceArray.forEach((key, index) => {
        if (key === '') return;
        dataRow.push(items[index]);
    })
    parsedData.push(dataRow);
  });

  writeToPostgres(parsedData);
});
