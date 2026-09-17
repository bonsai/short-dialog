#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { split } from "./core.js";

const [, , command, input, flag, output = "shorts"] = process.argv;

if (command === "split") {
  const dialog = JSON.parse(readFileSync(input, "utf8"));
  const shorts = split(dialog);
  mkdirSync(output, { recursive: true });
  shorts.forEach((short) => {
    writeFileSync(join(output, `${short.index}.json`), JSON.stringify(short, null, 2));
  });
  console.log(`created ${shorts.length} Shorts in ${output}`);
} else {
  console.log(`short-dialog split <dialog.json> --out <directory>`);
  process.exitCode = 1;
}
