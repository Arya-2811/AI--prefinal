import { RequestHandler } from "express";
import crypto from "crypto";
import { getUserByToken } from "./auth";

interface Template {
  id: string;
  title: string;
  content: string;
  category: string; // frontend, backend, devops, etc
  tags: string[];
  updatedBy: string;
  updatedAt: number;
}

const templates: Template[] = [
  {
    id: crypto.randomBytes(6).toString("hex"),
    title: "React component pattern",
    content: "Use composition over inheritance. Split UI into small components.",
    category: "frontend",
    tags: ["react", "composition"],
    updatedBy: "seed",
    updatedAt: Date.now(),
  },
];

export const listTemplates: RequestHandler = (req, res) => {
  const q = (req.query.q as string) || "";
  const category = (req.query.category as string) || "";
  const filtered = templates.filter((t) => {
    const matchesQ = q ? (t.title + " " + t.content).toLowerCase().includes(q.toLowerCase()) : true;
    const matchesCat = category ? t.category === category : true;
    return matchesQ && matchesCat;
  });
  res.json({ templates: filtered.sort((a, b) => b.updatedAt - a.updatedAt) });
};

export const createTemplate: RequestHandler = async (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.replace("Bearer ", "");
  const user = await getUserByToken(token);
  if (!user || user.role !== "Admin") return res.status(403).json({ error: "Forbidden" });
  const { title, content, category, tags } = req.body as { title?: string; content?: string; category?: string; tags?: string[] };
  if (!title || !content || !category) return res.status(400).json({ error: "Missing fields" });
  const t: Template = {
    id: crypto.randomBytes(12).toString("hex"),
    title,
    content,
    category,
    tags: (tags || []).slice(0, 10),
    updatedBy: user.id,
    updatedAt: Date.now(),
  };
  templates.push(t);
  res.status(201).json({ template: t });
};

export const updateTemplate: RequestHandler = async (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.replace("Bearer ", "");
  const user = await getUserByToken(token);
  if (!user || user.role !== "Admin") return res.status(403).json({ error: "Forbidden" });
  const id = req.params.id;
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const { title, content, category, tags } = req.body as Partial<Template>;
  const current = templates[idx];
  const updated: Template = {
    ...current,
    title: title ?? current.title,
    content: content ?? current.content,
    category: category ?? current.category,
    tags: tags ?? current.tags,
    updatedBy: user.id,
    updatedAt: Date.now(),
  };
  templates[idx] = updated;
  res.json({ template: updated });
};
