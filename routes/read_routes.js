const fs = require("fs");
const readline = require("readline");

const geojson = JSON.parse(fs.readFileSync('out.geojson', 'utf8'));

console.log(geojson.features[0]);