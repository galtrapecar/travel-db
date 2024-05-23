const fs = require("fs");
const readline = require("readline");

const monuments = fs.createWriteStream("monuments.txt");
const windmills = fs.createWriteStream("windmills.txt");
const readStream = fs.createReadStream("allCountries.txt");

const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  if (line.includes("MNMT")) monuments.write(`${line}\n`);
  if (line.includes("MLWND")) windmills.write(`${line}\n`);
});

rl.on("close", () => {
  monuments.end();
  windmills.end();
});
