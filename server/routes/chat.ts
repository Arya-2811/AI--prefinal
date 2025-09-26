import { RequestHandler } from "express";
import { trackEvent } from "./metrics";

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyArqHyI8NeFp9f1QhSqGBmLq-MyiJR5BCw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an expert AI coding assistant specializing in:
- React, TypeScript, and modern web development
- Docker containerization and best practices  
- Kubernetes deployment and orchestration
- DevOps practices and CI/CD
- Code review and optimization
- Best practices for scalable applications

Keep responses concise, practical, and focused on actionable advice. When providing code examples, make them clear and well-commented.`;

// Fallback FAQ for when API fails
const FAQ: { pattern: RegExp; answer: string }[] = [
  { pattern: /react|component/i, answer: "Prefer functional components with hooks. Keep components small and focused." },
  { pattern: /docker/i, answer: "Use multi-stage builds. Keep images small and pin base image versions." },
  { pattern: /kubernetes|k8s/i, answer: "Deploy stateless services behind Deployments. Use readiness/liveness probes and resource requests/limits." },
  { pattern: /tabnine/i, answer: "Tabnine provides AI code completion in IDEs. Use it to accelerate coding, but always review suggestions." },
  { pattern: /auth|login|jwt/i, answer: "Use short-lived tokens, HTTPS, and rotate secrets. Never store passwords in plain text." },
];

async function callGemini(message: string, context?: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}${context ? `\n\nContext: ${context}` : ''}\n\nUser: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export const chat: RequestHandler = async (req, res) => {
  const { message, context } = req.body as { message?: string; context?: string };
  const start = Date.now();
  
  if (!message || !message.trim()) {
    return res.json({ 
      answer: "I can help with coding, DevOps, and best practices. Ask me about React, Docker, or Kubernetes.",
      latency: Date.now() - start 
    });
  }

  try {
    // Try Gemini API first
    const answer = await callGemini(message.trim(), context);
    const latency = Date.now() - start;
    trackEvent("queries");
    res.json({ answer, latency });
  } catch (error) {
    // Fallback to FAQ system if API fails
    console.log("Falling back to FAQ system:", error);
    let answer = "I can help with coding, DevOps, and best practices. Ask me about React, Docker, or Kubernetes.";
    const match = FAQ.find((f) => f.pattern.test(message));
    if (match) answer = match.answer;
    
    const latency = Date.now() - start;
    trackEvent("queries");
    res.json({ answer: `${answer} (Note: AI service temporarily unavailable)`, latency });
  }
};
