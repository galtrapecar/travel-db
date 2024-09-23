require("dotenv").config();
const fs = require("fs");
const pg = require("pg");
const format = require("pg-format");

const writeToPostgres = async (data) => {
  const pgdatabase = "geoinfo";
  delete process.env.PGDATABASE;

  const pool = new pg.Pool({
    database: pgdatabase,
  });

  //   const client = await pool.connect();

  let query = "";

  let i = 0;
  for (const values of data) {
    query += `UPDATE pois SET nearest_city_id = ${values.nearest_city_id} WHERE id = ${values.id};`;
    if (i % 10 === 0) console.log(`${i} / ${data.length} done.`);
    i++;
  }

  fs.writeFileSync("update.sql", query);

  //   await client.query(query);
  //   client.release();
};

const updatePoisDB = async () => {
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
        `
            ALTER TABLE cities
            ADD CONSTRAINT pk_id PRIMARY KEY (id);

            ALTER TABLE pois
            ADD nearest_city_id INTEGER;

            ALTER TABLE pois 
            ADD CONSTRAINT fk_nearest_city
            FOREIGN KEY (nearest_city_id) 
            REFERENCES cities (id);
        `
      );
    } catch (err) {
      console.error("Error while inserting data: ", err);
    } finally {
      await client.end();
    }
  }
};

(async () => {
  await updatePoisDB();
  fs.readFile(
    "./assigning_cities/pois_with_cities.csv",
    "utf-8",
    (err, data) => {
      if (err) {
        console.log("Error while reading pois_with_cities.csv:", err);
        return;
      }

      const headerReferenceArray = [
        "",
        "id",
        "name",
        "name_ascii",
        "lat",
        "lng",
        "iso2",
        "location",
        "type",
        "nearest_city_id",
      ];

      const dataMapArray = [];

      const lines = data.split(/\r?\n/);
      lines.forEach((line) => {
        const items = line.split("\t");
        const dataMap = {};
        items.forEach((item, index) => {
          if (
            headerReferenceArray[index] === "id" ||
            headerReferenceArray[index] === "nearest_city_id"
          ) {
            dataMap[headerReferenceArray[index]] = item.replaceAll('"', "");
          }
        });
        dataMapArray.push(dataMap);
      });

      writeToPostgres(dataMapArray);
    }
  );
})();
