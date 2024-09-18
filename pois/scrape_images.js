require("dotenv").config();
const fs = require("fs");
const { default: axios } = require("axios");

const args = process.argv.slice(2);

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

fs.readFile(args[0], "utf-8", (err, data) => {
  if (err) {
    console.log(`Error while reading ${args[0]}:`, err);
    return;
  }

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
    parsedData.push(dataRow);
  });

  const start_index = 0;
  const array = parsedData.slice(start_index);

  (async () => {
    let urls = {};
    let i = start_index;
    if (i === 0) fs.appendFileSync("image_urls.json", "[");
    const length = parsedData.length;
    for (const data of array) {
      i++;
      const id = data.at(0);
      const poi = data.at(1);
      const url = `https://duckduckgo.com/i.js`;
      const vqd = await getVqdToken(poi);

      try {
        const response = await axios.get(url, {
          params: {
            o: "json",
            q: poi,
            vqd,
            f: ",,,,,",
            p: 1,
          },
        });

        const data = response.data;
        urls[id] = data.results[0].image;

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
