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

  const referenceArray = [
    "id",
    "name",
    "name_ascii",
    "",
    "lat",
    "lng",
    "",
    "",
    "iso2",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "location",
    "",
  ];

  const parsedData = [];

  lines.forEach((line) => {
    const items = line.split("\t");
    const dataRow = [];
    referenceArray.forEach((key, index) => {
      if (key === "") return;
      dataRow.push(items[index]);
    });
    dataRow.push(type);
    parsedData.push(dataRow);
  });

  writeToPostgres(parsedData);
};

const groups = {
  // monuments: "monument",
  // windmills: "windmill",
  // pieces_of_art: "piece_of_art",
  // bridges: "bridge",
  // churches: "church",
  // castles: "castle",
  // historical_sites: "historical_site",
  // mosques: "mosque",
  // museums: "museum",
  // palaces: "palace",
  // pyramids: "pyramid",
  // religious_sites: "religious_site",
  // towers: "tower",
  synagogues: "synagogue",
};

Object.keys(groups).forEach((group) => {
  fs.readFile(`${group}.txt`, "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    readPoi(data, groups[group]);
  });
});
