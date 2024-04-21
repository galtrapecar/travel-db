const fs = require("fs");
const readline = require("readline");

const writeStream = fs.createWriteStream("monuments.txt");
const readStream = fs.createReadStream("allCountries.txt");

const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  if (!line.includes("MNMT")) return;
  writeStream.write(`${line}\n`);
});

rl.on("close", () => {
  writeStream.end();
});
