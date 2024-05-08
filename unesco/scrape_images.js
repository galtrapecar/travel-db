const { default: axios } = require("axios");
const fs = require("fs");
const parseString = require("xml2js").parseString;

// Note - parks tipically don't have images on the whc site
// Some manual work is needed

const urls = [];

const scrape_image_url = async (url, i) => {
  if (i > 3) return "error";
  if (i > 0) console.log("retrying " + i + "/3");
  try {
    const response = await axios.get(url);
    const html = response.data;
    const regex = /<img.+https:\/\/whc.unesco.org\/uploads.+>/;
    const results = regex.exec(html);
    if (!results) return scrape_image_url(url, i + 1);
    const image_url_fragment = results[0];
    const urlRegex = /\"https:\/\/[0-9A-Za-z\.\/\-\_]+\"/;
    const image_url_results = urlRegex.exec(image_url_fragment);
    return image_url_results[0].replace('"', "");
  } catch (error) {
    return scrape_image_url(url, i + 1);
  }
};

(async () => {
  const text = fs.readFileSync("unesco.xml");
  parseString(text, async (_, result) => {
    const rows = result.query.row;
    let i = 0;
    for (const row of rows) {
      urls.push(await scrape_image_url(row.http_url[0], 0));
      i += 1;
      console.log(`${i}/${rows.length} done`);
    }
    fs.writeFileSync("image_urls.json", JSON.stringify(urls));
  });
})();
