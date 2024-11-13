require("dotenv").config();
const pg = require("pg");
const format = require("pg-format");

const pgdatabase = "geoinfo";
delete process.env.PGDATABASE;

(async () => {
  const { Client } = pg;
  {
    const client = new Client();
    await client.connect();
    try {
      await client.query(format("CREATE DATABASE %s;", pgdatabase));
    } catch (err) {
      if (err.code !== "42P04") {
        console.log(err);
      }
    } finally {
      client.end();
    }
  }

  {
    const client = new Client();
    await client.connect();
    try {
      await client.query("CREATE EXTENSION cube;");
    } catch (err) {
      if (err.code !== 42710) {
        console.log(err);
      }
    } finally {
      client.end();
    }
  }

  {
    const client = new Client();
    await client.connect();
    try {
      await client.query("CREATE EXTENSION earthdistance;");
    } catch (err) {
      if (err.code !== 42710) {
        console.log(err);
      }
    } finally {
      client.end();
    }
  }

  {
    const client = new Client({
      database: pgdatabase,
    });
    await client.connect();
    try {
      await client.query(
        format(
          "CREATE TABLE cities (city TEXT, city_ascii TEXT, lat DECIMAL, lng DECIMAL, country TEXT, iso2 CHAR(2), iso3 CHAR(3), population INTEGER, image_url TEXT, id INTEGER);"
        )
      );
    } catch (err) {
      if (err.code !== "42P07") {
        console.log(err);
      }
    } finally {
      client.end();
    }
  }

  {
    const client = new Client({
      database: pgdatabase,
    });
    await client.connect();
    try {
      await client.query(
        format(
          "CREATE TABLE pois (id INTEGER, name TEXT, name_ascii TEXT, lat DECIMAL, lng DECIMAL, iso2 CHAR(2), location TEXT, type TEXT);"
        )
      );
    } catch (err) {
      if (err.code !== "42P07") {
        console.log(err);
      }
    } finally {
      client.end();
    }
  }

  {
    const client = new Client({
      database: pgdatabase,
    });
    await client.connect();
    try {
      await client.query(
        format(
          "CREATE TABLE unesco (id INTEGER, name TEXT, category TEXT, url TEXT, image_url TEXT, iso2 CHAR(2)[], lat DECIMAL, lng DECIMAL, description TEXT);"
        )
      );
    } catch (err) {
      if (err.code !== "42P07") {
        console.log(err);
      }
    } finally {
      client.end();
    }
  }

  {
    const client = new Client({
      database: pgdatabase,
    });
    await client.connect();
    try {
      await client.query(
        format(
          "CREATE TABLE slo_churches (name TEXT, lat DECIMAL, lng DECIMAL);"
        )
      );
    } catch (err) {
      if (err.code !== "42P07") {
        console.log(err);
      }
    } finally {
      client.end();
    }
  }
})();
