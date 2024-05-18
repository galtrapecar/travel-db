require("dotenv").config();
const fs = require("fs");
const { default: axios } = require("axios");

const getVqdToken = async (keywords) => {
  let token = null;
  try {
    let res = await axios.get("https://duckduckgo.com/", {
      params: {
        q: keywords,
      },
    });

    token = res.data.match(/vqd=([\d-]+)\&/)[1];
  } catch (error) {
    console.error(error);
  }
  return new Promise((resolve, reject) => {
    if (!token) reject("Failed to get token");
    resolve(token);
  });
};

fs.readFile("worldcities.csv", "utf-8", (err, data) => {
  if (err) {
    console.log("Error while reading worldcities.csv:", err);
    return;
  }

  const lines = data.split(/\r?\n/);
  const firstLine = lines.shift();
  // remove last line if empty
  if (lines.at(-1) === "") lines.pop();

  if (!firstLine) {
    console.log("File is empty, nothing was read.");
    return;
  }

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
      if (headerReferenceArray[index] === "population" && item === "") {
        dataMap[headerReferenceArray[index]] = 0;
        return;
      }
      dataMap[headerReferenceArray[index]] = item.replaceAll('"', "");
    });
    dataMapArray.push(Object.values(dataMap));
  });

  const start_index = 4440;
  const array = dataMapArray.slice(start_index);

  (async () => {
    let urls = {};
    let i = start_index;
    if (i === 0) fs.appendFileSync("image_urls.json", "[");
    const length = dataMapArray.length;
    for (const data of array) {
      i++;
      const id = data.at(-1);
      const city = data.at(0);
      const country = data.at(4);
      const url = `https://duckduckgo.com/i.js`;
      const vqd = await getVqdToken(`${city} city town ${country}`);

      try {
        const response = await axios.get(url, {
          params: {
            o: "json",
            q: `${city} city town ${country}`,
            vqd,
            f: ",,,,,",
            p: 1,
          },
        });

        const data = response.data;
        urls[id] = data.results[0];

        if (i % 10 === 0) {
          fs.appendFileSync(
            "image_urls.json",
            (i !== 10 ? "," : "") + JSON.stringify(urls)
          );
          urls = {};
        }

        console.log(`Done ${i} / ${length}`);
      } catch (error) {
        console.log(error);
        urls[id] = "error";
      }
    }
    fs.appendFileSync("image_urls.json", "]");
  })();
});
