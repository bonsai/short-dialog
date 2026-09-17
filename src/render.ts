import { execFile } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import type { ShortDialog } from "./core.js";

const execFileAsync = promisify(execFile);

export type RenderOptions = {
  width?: number;
  height?: number;
  fps?: number;
  output: string;
};

function assTime(seconds: number): string {
  const cs = Math.max(0, Math.round(seconds * 100));
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const s = Math.floor((cs % 6000) / 100);
  const c = cs % 100;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(c).padStart(2, "0")}`;
}

function escapeAss(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\N");
}

function assContent(short: ShortDialog, width: number, height: number): string {
  const events = short.messages
    .map((m) => {
      const style = m.speaker === "left" ? "Left" : "Right";
      return `Dialogue: 0,${assTime(m.start)},${assTime(m.end)},${style},,0,0,0,,${escapeAss(m.text)}`;
    })
    .join("\n");

  return `[Script Info]\nScriptType: v4.00+\nPlayResX: ${width}\nPlayResY: ${height}\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Left,Noto Sans CJK JP,52,&H00FFFFFF,&H00FFFFFF,&H001E1E1E,&HCC222222,0,0,0,0,100,100,0,0,3,18,0,4,90,90,120,1\nStyle: Right,Noto Sans CJK JP,52,&H00FFFFFF,&H00FFFFFF,&H001E1E1E,&HCC1677FF,0,0,0,0,100,100,0,0,3,18,0,6,90,90,120,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${events}\n`;
}

export async function render(short: ShortDialog, options: RenderOptions): Promise<void> {
  const width = options.width ?? 1080;
  const height = options.height ?? 1920;
  const fps = options.fps ?? 30;
  const output = options.output;
  const tempDir = join(dirname(output), `.short-dialog-${short.id}`);
  const assPath = join(tempDir, `${short.id}.ass`);

  if (width / height !== 9 / 16) {
    throw new Error("Renderer output must use a 9:16 aspect ratio");
  }

  mkdirSync(dirname(output), { recursive: true });
  mkdirSync(tempDir, { recursive: true });
  writeFileSync(assPath, assContent(short, width, height), "utf8");

  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-f", "lavfi",
      "-i", `color=c=black:s=${width}x${height}:r=${fps}:d=${short.duration}`,
      "-vf", `subtitles=${assPath.replace(/\\/g, "/").replace(/:/g, "\\:")}`,
      "-t", String(short.duration),
      "-an",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      output,
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`ffmpeg render failed. Install ffmpeg and ensure the subtitles/libass filter is available. ${message}`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
