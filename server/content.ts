import { ulid } from "ulid";
import { openKv } from "./kv.ts";
import { Content, Output, Settings } from "../schema/schema.ts";

// Schema:
// - contents: (author, contentId) => Content
// - images: (author, contentId, index) => PartialImage

async function getImage(
  author: string,
  contentId: string
): Promise<string | null> {
  const kv = await openKv();
  const partials: string[] = [];
  for await (const entry of kv.list<string>({
    prefix: ["images", author, contentId],
  })) {
    partials.push(entry.value);
  }
  if (partials.length === 0) {
    return null;
  }
  return partials.join("");
}
async function setImage(author: string, contentId: string, image: string) {
  await deleteImage(author, contentId);
  const kv = await openKv();
  const partialLength = 64_000;
  const len = Math.ceil(image.length / partialLength);
  for (let i = 0; i < len; i++) {
    const partial = image.slice(i * partialLength, (i + 1) * partialLength);
    await kv.set(["images", author, contentId, i], partial);
  }
}
async function deleteImage(author: string, contentId: string) {
  const kv = await openKv();
  for await (const entry of kv.list<string>({
    prefix: ["images", author, contentId],
  })) {
    await kv.delete(entry.key);
  }
}
async function getContent(
  author: string,
  contentId: string
): Promise<Content | null> {
  const kv = await openKv();
  const content = await kv.get<Content>(["contents", author, contentId]);
  return content.value;
}
async function listContent(author: string) {
  const kv = await openKv();
  const contents: Content[] = [];
  for await (const entry of kv.list<Content>({
    prefix: ["contents", author],
  })) {
    contents.push(entry.value);
  }
  return contents;
}
async function setContent(
  author: string,
  contentId: string,
  content: Content
): Promise<void> {
  const kv = await openKv();
  await kv.set(["contents", author, contentId], content);
}
async function deleteContent(author: string, contentId: string): Promise<void> {
  const kv = await openKv();
  await kv.delete(["contents", author, contentId]);
}

export class ContentNotFoundError extends Error {
  constructor() {
    super("Content not found");
  }
}
export class AuthorDoesNotMatchError extends Error {
  constructor() {
    super("Author does not match");
  }
}
export class TooManyContentsError extends Error {
  constructor() {
    super("Too many content");
  }
}

export async function getUserContent(
  author: string,
  contentId: string
): Promise<Content | null> {
  const content = await getContent(author, contentId);
  return content;
}
export async function getUserContentImage(
  author: string,
  contentId: string
): Promise<string | null> {
  return await getImage(author, contentId);
}
export async function listUserContents(author: string): Promise<Content[]> {
  const contents = await listContent(author);
  return contents;
}
export async function createContent(
  userName: string,
  author: string,
  settings: Settings,
  output: Output,
  thumbnail: string,
  image: string
): Promise<Content> {
  if (userName !== author) {
    throw new AuthorDoesNotMatchError();
  }
  const contents = await listContent(author);
  if (contents.length >= 100) {
    throw new TooManyContentsError();
  }
  const createdAt = new Date().toISOString();
  const contentId = ulid();
  const content: Content = {
    id: contentId,
    author,
    settings,
    output,
    thumbnail,
    createdAt,
    updatedAt: createdAt,
  };
  await setContent(author, contentId, content);
  await setImage(author, contentId, image);
  return content;
}
export async function updateContent(
  userName: string,
  author: string,
  contentId: string,
  settings: Settings,
  output: Output,
  thumbnail: string,
  image: string
): Promise<Content> {
  if (userName !== author) {
    throw new AuthorDoesNotMatchError();
  }
  const updatedAt = new Date().toISOString();
  const contentWithoutImage = await getContent(author, contentId);
  if (contentWithoutImage == null) {
    throw new ContentNotFoundError();
  }
  const content = {
    ...contentWithoutImage,
    updatedAt,
    settings,
    output,
    thumbnail,
  };
  await setContent(author, contentId, content);
  await setImage(author, contentId, image);
  return content;
}
export async function removeContent(
  userName: string,
  author: string,
  contentId: string
): Promise<void> {
  if (userName !== author) {
    throw new AuthorDoesNotMatchError();
  }
  await deleteContent(author, contentId);
  await deleteImage(author, contentId);
}
export async function removeAllUserContents(
  author: string
): Promise<Content[]> {
  const contents = await listContent(author);
  for (const content of contents) {
    await deleteContent(author, content.id);
    await deleteImage(author, content.id);
  }
  return contents;
}
