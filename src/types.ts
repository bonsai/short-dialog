export type Speaker = "left" | "right";

export interface Message {
  id: string;
  speaker: Speaker;
  text: string;
  start: number;
  end: number;
}

export interface Dialog {
  id: string;
  title: string;
  duration: number;
  messages: Message[];
  youtube?: {
    title?: string;
    description?: string;
    tags?: string[];
    privacyStatus?: "private" | "unlisted" | "public";
  };
}

export interface Short {
  id: string;
  index: number;
  start: number;
  end: number;
  duration: number;
  messages: Message[];
}
