import { BlockDocument } from "@/components/ui/block-editor";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTitle(doc: BlockDocument) {
  const content = doc[0]?.content as unknown;
  if (typeof content === "string") {
    return content.replace(/[*#_]/g, "").trim();
  }
  if (Array.isArray(content)) {
    const row = (content as { type: string; text?: unknown }[])
      .filter((i) => i.type === "text" && typeof i.text === "string")
      .map((i) => i.text);
    return row.join(" ").replace(/[*#_]/g, "").trim();
  }
  return "";
}

const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

export function getTags(content: string) {
  const regex = /\B#[a-zA-Z0-9_]+\b/g;
  const tags = content.match(regex);
  if (!tags) return [];

  return (
    tags
      // filter hex color
      .filter((i) => !hexColorRegex.test(i) && i !== "#x20")
      // remove #
      .map((tag) => tag.slice(1))
  );
}

const emojiRegex =
  /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;

export function extractEmoji(text: string) {
  return text.match(emojiRegex)?.[0] || null;
}

export function bytesToReadable(bytes: unknown) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const num = Number(bytes);

  if (Number.isNaN(num)) return "n/a";
  if (num === 0) return "0 Bytes";

  const i = Math.floor(Math.log2(num) / 10);
  return `${(num / 2 ** (i * 10)).toFixed(2)} ${sizes[i]}`;
}
