require("dotenv").config();
const json = require("./image_urls.json");
const pg = require("pg");

const pgdatabase = "geoinfo";
delete process.env.PGDATABASE;

const writeToPostgres = async (id, image_url) => {
  const { Client } = pg;
  {
    const client = new Client({
      database: pgdatabase,
    });
    await client.connect();
    try {
      await client.query("UPDATE cities SET image_url = $1 WHERE id = $2", [
        image_url,
        id,
      ]);
    } catch (err) {
      console.error("Error while inserting data: ", err);
    } finally {
      await client.end();
    }
  }
};

(async () => {
  for (const chunk of json) {
    for (const cityId of Object.keys(chunk)) {
      await writeToPostgres(cityId, chunk[cityId].image);
    }
  }
})();
