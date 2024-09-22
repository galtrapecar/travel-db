const fs = require("fs");
const readline = require("readline");

const streams = {
  // monuments: fs.createWriteStream("monuments.txt"),
  // windmills: fs.createWriteStream("windmills.txt"),
  // pieces_of_art: fs.createWriteStream("pieces_of_art.txt"),
  // bridges: fs.createWriteStream("bridges.txt"),
  // churches: fs.createWriteStream("churches.txt"),
  // castles: fs.createWriteStream("castles.txt"),
  // historical_sites: fs.createWriteStream("historical_sites.txt"),
  // mosques: fs.createWriteStream("mosques.txt"),
  // museums: fs.createWriteStream("museums.txt"),
  // palaces: fs.createWriteStream("palaces.txt"),
  // pyramids: fs.createWriteStream("pyramids.txt"),
  // religious_sites: fs.createWriteStream("religious_sites.txt"),
  // towers: fs.createWriteStream("towers.txt"),
  synagogues: fs.createWriteStream("synagogues.txt"),
};
const readStream = fs.createReadStream("allCountries.txt");

const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  // if (line.includes("\tMNMT\t")) streams.monuments.write(`${line}\n`);
  // if (line.includes("\tMLWND\t")) streams.windmills.write(`${line}\n`);
  // if (line.includes("\tART\t")) streams.pieces_of_art.write(`${line}\n`);
  // if (line.includes("\tBDG\t")) streams.bridges.write(`${line}\n`);
  // if (line.includes("\tCH\t")) streams.churches.write(`${line}\n`);
  // if (line.includes("\tCSTL\t")) streams.castles.write(`${line}\n`);
  // if (line.includes("\tHSTS\t")) streams.historical_sites.write(`${line}\n`);
  // if (line.includes("\tMSQE\t")) streams.mosques.write(`${line}\n`);
  // if (line.includes("\tMUS\t")) streams.museums.write(`${line}\n`);
  // if (line.includes("\tPAL\t")) streams.palaces.write(`${line}\n`);
  // if (line.includes("\tPYR\t") || line.includes("\tPYRS\t")) streams.pyramids.write(`${line}\n`);
  // if (line.includes("\tRLG\t")) streams.religious_sites.write(`${line}\n`);
  // if (line.includes("\tTOWR\t")) streams.towers.write(`${line}\n`);

  if (line.includes("SYG\t")) streams.synagogues.write(`${line}\n`);
});

rl.on("close", () => {
  for (const stream of Object.values(streams)) {
    stream.end();
  }
});
