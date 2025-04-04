import { BlockDocument } from "@/components/ui/block-editor";
import db, { Note } from "@/lib/db";
import { getTitle, getTags } from "@/lib/utils";
import { nanoid } from "nanoid";

export async function getNote(id: string) {
  const data = await db.notes.get(id!);
  if (!data) {
    throw new Error("Note not found");
  }
  return data;
}

export async function updateNote(id: string, data: Partial<Note>) {
  return db.notes.update(id, {
    ...data,
    updated: Date.now(),
  });
}

export async function deleteNote(id: string) {
  // Mark note as deleted
  const now = Date.now();
  return db.notes.update(id, {
    updated: now,
    deleted: now,
  });
}

export async function putNoteContent(
  id: string,
  content: BlockDocument,
  plain: string
) {
  const now = Date.now();
  const summary = plain
    .replace(/\n\s*\n/g, "\n")
    .split("\n")
    .slice(1)
    .join("\n");
  const tags = getTags(plain) || [];

  await db.notes.update(id, {
    title: getTitle(content) || "Untitled",
    content,
    summary,
    tags,
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
    name: file.name,
    type: file.type,
    size: file.size,
    data: file,
    created: now,
    updated: now,
  });

  return attachmentId;
}

export async function getAttachment(uri: string) {
  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return null;
  }

  const file = await db.attachments.get(uri);
  if (!file) {
    return null;
  }
  return URL.createObjectURL(file.data);
}
