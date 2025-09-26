import { RequestHandler } from "express";
import crypto from "crypto";
import { getUserByToken } from "./auth";

interface Snippet {
  id: string;
  content: string;
  language: string;
  tags: string[];
  authorId: string;
  createdAt: number;
}

const snippets: Snippet[] = [];

function newId() {
  return crypto.randomBytes(12).toString("hex");
}

export const listSnippets: RequestHandler = (req, res) => {
  const q = (req.query.q as string) || "";
  const tag = (req.query.tag as string) || "";
  const filtered = snippets.filter((s) => {
    const matchesQ = q ? s.content.toLowerCase().includes(q.toLowerCase()) : true;
    const matchesTag = tag ? s.tags.includes(tag) : true;
    return matchesQ && matchesTag;
  });
  res.json({ snippets: filtered.sort((a, b) => b.createdAt - a.createdAt) });
};

export const createSnippet: RequestHandler = async (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.replace("Bearer ", "");
  const user = await getUserByToken(token);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { content, language, tags } = req.body as { content?: string; language?: string; tags?: string[] };
  if (!content || !language) return res.status(400).json({ error: "Missing fields" });
  const snip: Snippet = {
    id: newId(),
    content,
    language,
    tags: (tags || []).slice(0, 5),
    authorId: user.id,
    createdAt: Date.now(),
  };
  snippets.push(snip);
  res.status(201).json({ snippet: snip });
};
