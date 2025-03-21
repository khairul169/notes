import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTitle(content: string) {
  let line = content.split("\n")[0];
  // remove any markdown syntax, like header, bold, etc
  line = line.replace(/[*#_]/g, "");
  return line.trim();
}

const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

export function getTags(content: string) {
  const regex = /\B#[a-zA-Z0-9_]+\b/g;
  const tags = content.match(regex);
  if (!tags) return [];

  return (
    tags
      // filter hex color
      .filter((i) => !hexColorRegex.test(i))
      // remove #
      .map((tag) => tag.slice(1))
  );
}

const emojiRegex =
  /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;

export function extractEmoji(text: string) {
  return text.match(emojiRegex)?.[0] || null;
}
