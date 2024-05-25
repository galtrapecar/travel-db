require("dotenv").config();
const fs = require("fs");
const pg = require("pg");
const format = require("pg-format");

const writeToPostgres = async (data) => {
  const pgdatabase = "geoinfo";
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
          "INSERT INTO pois (id, name, name_ascii, lat, lng, iso2, location, type) VALUES %L",
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

const readPoi = (data, type) => {
  const lines = data.split(/\r?\n/);
  if (lines.at(-1) === "") lines.pop();

  const referenceArray = ['id', 'name', 'name_ascii', '', 'lat', 'lng', '', '', 'iso2', '', '', '', '', '', '', '', '', 'location', ''];

  const parsedData = [];

  lines.forEach((line) => {
    const items = line.split('\t');
    const dataRow = [];
    referenceArray.forEach((key, index) => {
        if (key === '') return;
        dataRow.push(items[index]);
    })
    dataRow.push(type);
    parsedData.push(dataRow);
  });

  writeToPostgres(parsedData);
};

fs.readFile("monuments.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "monument");
});

fs.readFile("windmills.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "windmill");
});

fs.readFile("pieces_of_art.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "piece_of_art");
});

fs.readFile("bridges.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "bridge");
});

fs.readFile("churches.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "church");
});

fs.readFile("castles.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "castle");
});

fs.readFile("historical_sites.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "historical_site");
});

fs.readFile("mosques.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "mosque");
});

fs.readFile("museums.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "museum");
});

fs.readFile("palaces.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "palace");
});

fs.readFile("pyramids.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "pyramid");
});

fs.readFile("religious_sites.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "religious_site");
});

fs.readFile("towers.txt", "utf-8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  readPoi(data, "tower");
});
