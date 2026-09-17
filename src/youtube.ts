export type YouTubeUpload = {
  file: string;
  title: string;
  description?: string;
  tags?: string[];
  privacyStatus?: "private" | "unlisted" | "public";
};

/**
 * Adapter boundary for YouTube Data API v3 OAuth upload.
 * Credentials/tokens must come from the runtime environment, never dialog.json.
 */
export async function uploadShort(video: YouTubeUpload) {
  void video;
  throw new Error("YouTube uploader not implemented yet");
}
