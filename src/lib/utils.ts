import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTitle(content: string) {
  let line = content.split("\n")[0].trim();
  // remove any markdown syntax, like header, bold, etc
  line = line.replace(/[*#_]/g, "");
  return line;
}

export function getTags(content: string) {
  const regex = /\B\#[a-zA-Z0-9_]+\b/g;
  const tags = content.match(regex);
  return tags ? tags.map((tag) => tag.slice(1)) : [];
}
