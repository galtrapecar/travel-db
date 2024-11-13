const json = require("./rnpd.json");
require("dotenv").config();
const pg = require("pg");
const format = require("pg-format");

console.log(json.length);

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
        data.properties.IME,
        format(
          "INSERT INTO slo_churches (name, name_ascii, lat, lng, type, ) VALUES %L",
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

const data = json
  .filter((point) => point.properties?.GESLA?.includes("cerk"))
  .map((data) => [
    data.properties.IME,
    data.properties.IME,
    data.geometry.coordinates[1],
    data.geometry.coordinates[0],
    "church",
  ]);

writeToPostgres(data);
