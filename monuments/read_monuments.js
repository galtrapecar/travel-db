require("dotenv").config();
const fs = require("fs");
const pg = require("pg");
const format = require("pg-format");

const writeToPostgres = async (data) => {
  const pgdatabase = process.env.PGDATABASE;
  delete process.env.PGDATABASE;

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
    const client = new Client({
      database: pgdatabase,
    });
    await client.connect();
    try {
      await client.query(
        format(
          "CREATE TABLE monuments (id INTEGER, monument TEXT, monument_ascii TEXT, lat DECIMAL, lng DECIMAL, iso2 CHAR(2), location TEXT);"
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
          "INSERT INTO monuments (id, monument, monument_ascii, lat, lng, iso2, location) VALUES %L",
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

fs.readFile("monuments.txt", "utf-8", (err, data) => {
  if (err) {
    console.log("Error while reading monuments.txt:", err);
    return;
  }

  const lines = data.split(/\r?\n/);
  if (lines.at(-1) === "") lines.pop();

  const referenceArray = ['id', 'monument', 'monument_ascii', '', 'lat', 'lng', '', '', 'iso2', '', '', '', '', '', '', '', '', 'location', ''];

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
