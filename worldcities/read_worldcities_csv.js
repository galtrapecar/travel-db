require("dotenv").config();
const fs = require("fs");
const pg = require("pg");
const format = require("pg-format");

const writeToPostgres = async (data) => {
  const { Client } = pg;
  const client = new Client();
  await client.connect();

  try {
    await client.query(
      format(
        "INSERT INTO cities (city, city_ascii, lat, lng, country, iso2, iso3, population, id) VALUES %L",
        [...data]
      )
    );
  } catch (err) {
    console.error("Error while inserting data: ", err);
  } finally {
    await client.end();
  }
};

fs.readFile("worldcities.csv", "utf-8", (err, data) => {
  if (err) {
    console.log("Error while reading worldcities.csv:", err);
    return;
  }

  const lines = data.split(/\r?\n/);
  const firstLine = lines.shift();
  // remove last line if empty
  if (lines.at(-1) === '') lines.pop();

  if (!firstLine) {
    console.log("File is empty, nothing was read.");
    return;
  }

  // e.g. id, name, surname -> ['id', 'name', 'surname']
  // e.g. 1,  john, doe     -> { [map[0]]: line[0] }
  const headerReferenceArray = [];

  const header = firstLine.replaceAll('"', "").split(",");
  header.forEach((item) => headerReferenceArray.push(item));

  const dataMapArray = [];

  lines.forEach((line) => {
    const items = line.split('","');
    const dataMap = {};
    items.forEach((item, index) => {
      if (
        headerReferenceArray[index] === "admin_name" ||
        headerReferenceArray[index] === "capital"
      ) {
        return;
      }
      if (headerReferenceArray[index] === "population" && item === '') 
      {
        dataMap[headerReferenceArray[index]] = 0;
        return;
      }
      dataMap[headerReferenceArray[index]] = item.replaceAll('"', "");
    });
    dataMapArray.push(Object.values(dataMap));
  });

  if (process.argv.includes("--export-json")) {
    fs.writeFile("worldcities.json", JSON.stringify(dataMapArray), (err) => {
      if (!err) return;
      console.log("Error while writing worldcities.json:", err);
    });
  }

  writeToPostgres(dataMapArray);
});
