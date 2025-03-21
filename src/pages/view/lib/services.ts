import db from "@/lib/db";
import { getTags, getTitle } from "@/lib/utils";
import { nanoid } from "nanoid";

export async function deleteNote(id: string) {
  // Mark note as deleted
  const now = Date.now();
  return db.notes.update(id, {
    updated: now,
    deleted: now,
  });
}

export async function putNoteContent(id: string, content: string) {
  const now = Date.now();
  await db.notes.update(id, {
    title: getTitle(content) || "Untitled",
    content,
    tags: getTags(content || ""),
    updated: Date.now(),
  });
  return now;
}

export async function storeAttachment(noteId: string, file: File) {
  const attachmentId = nanoid();
  const now = Date.now();

  await db.attachments.put({
    id: attachmentId,
    noteId,
    type: file.type,
    data: file,
    created: now,
    updated: now,
  });

  return `attachment://${attachmentId}`;
}

export async function getAttachment(uri: string) {
  const id = uri.startsWith("attachment://") ? uri.split("//")[1] : uri;
  const file = await db.attachments.get(id);
  if (!file) {
    return null;
  }
  return URL.createObjectURL(file.data);
}
