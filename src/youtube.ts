import { createReadStream } from "node:fs";
import { google } from "googleapis";

export type YouTubeUpload = {
  file: string;
  title: string;
  description?: string;
  tags?: string[];
  privacyStatus?: "private" | "unlisted" | "public";
  categoryId?: string;
};

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

/** Upload a rendered vertical video through YouTube Data API v3 OAuth. */
export async function uploadShort(video: YouTubeUpload) {
  const oauth2 = new google.auth.OAuth2(
    env("YOUTUBE_CLIENT_ID"),
    env("YOUTUBE_CLIENT_SECRET"),
  );
  oauth2.setCredentials({ refresh_token: env("YOUTUBE_REFRESH_TOKEN") });

  const youtube = google.youtube({ version: "v3", auth: oauth2 });
  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: video.title,
        description: video.description,
        tags: video.tags,
        categoryId: video.categoryId ?? "22",
      },
      status: {
        privacyStatus: video.privacyStatus ?? "private",
      },
    },
    media: {
      body: createReadStream(video.file),
    },
  });

  return {
    id: response.data.id,
    url: response.data.id ? `https://youtube.com/shorts/${response.data.id}` : undefined,
  };
}
