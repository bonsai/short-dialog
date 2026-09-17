#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { split, validate } from "./core.js";
import { render } from "./render.js";
import { uploadShort } from "./youtube.js";

function usage(): never {
  console.log(`short-dialog

Commands:
  validate <dialog.json>
  split <dialog.json> --out <directory>
  render <short.json> --out <file.mp4>
  render-all <dialog.json> --out <directory>
  pipeline <dialog.json> --out <directory>
  upload <directory> --youtube [--title <title>]
`);
  process.exit(1);
}

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, "utf8"));
}

function flagValue(args: string[], name: string, fallback: string): string {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

async function main() {
  const [, , command, input, ...args] = process.argv;
  if (!command || !input) usage();

  if (command === "validate") {
    validate(readJson(input));
    console.log("valid: 80-second dialog");
    return;
  }

  if (command === "split") {
    const output = flagValue(args, "--out", "shorts");
    const shorts = split(readJson(input));
    mkdirSync(output, { recursive: true });
    shorts.forEach((short) => {
      writeFileSync(join(output, `${String(short.index).padStart(2, "0")}.json`), JSON.stringify(short, null, 2));
    });
    console.log(`created ${shorts.length} Shorts in ${output}`);
    return;
  }

  if (command === "render") {
    const output = flagValue(args, "--out", "dist/short.mp4");
    await render(readJson(input), { output });
    console.log(`rendered ${output}`);
    return;
  }

  if (command === "render-all" || command === "pipeline") {
    const output = flagValue(args, "--out", "dist");
    const shorts = split(readJson(input));
    mkdirSync(output, { recursive: true });
    for (const short of shorts) {
      const file = join(output, `${String(short.index).padStart(2, "0")}.mp4`);
      await render(short, { output: file });
      writeFileSync(join(output, `${String(short.index).padStart(2, "0")}.json`), JSON.stringify(short, null, 2));
      console.log(`rendered ${file}`);
    }
    console.log(`pipeline complete: ${shorts.length} × 20s MP4`);
    return;
  }

  if (command === "upload") {
    if (!args.includes("--youtube")) usage();
    const title = flagValue(args, "--title", "Short Dialog");
    const files = readdirSync(input)
      .filter((file) => /^\d{2}\.mp4$/.test(file))
      .sort();
    if (!files.length) throw new Error(`No numbered MP4 files found in ${input}`);
    for (const file of files) {
      const result = await uploadShort({
        file: join(input, file),
        title: `${title} #${file.slice(0, 2)}`,
        privacyStatus: process.env.YOUTUBE_PRIVACY_STATUS as "private" | "unlisted" | "public" | undefined,
      });
      console.log(`${file}: ${result.url ?? result.id ?? "uploaded"}`);
    }
    return;
  }

  usage();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
