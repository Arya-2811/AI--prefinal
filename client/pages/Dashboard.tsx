import { useEffect, useMemo, useState } from "react";
import AIEditor from "@/features/ai-coding/AIEditor";
import ChatbotWidget from "@/features/ai-chatbot/ChatbotWidget";
import SnippetsPanel from "@/features/collab-workspace/SnippetsPanel";
import KnowledgeHubPanel from "@/features/knowledge-hub/KnowledgeHubPanel";
import UsageSummary from "@/features/analytics/UsageSummary";
import { useAuth } from "@/services/auth-context";
import { RoleGate } from "@/services/role-based-access";

export default function Dashboard() {
  const { user } = useAuth();
  const [language, setLanguage] = useState("javascript");

  const langs = useMemo(
    () => [
      { id: "javascript", label: "JavaScript" },
      { id: "python", label: "Python" },
      { id: "cpp", label: "C++" },
      { id: "java", label: "Java" },
    ],
    [],
  );

  useEffect(() => {
    document.title = "Dashboard — Lazy AI";
  }, []);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome{user ? `, ${user.name}` : ""}
          </h1>
          <p className="text-foreground/70">
            AI code assistant, collaboration hub, knowledge base, and analytics — in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Language</label>
          <select
            className="rounded-md border bg-background px-3 py-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {langs.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AIEditor language={language} />
          <SnippetsPanel />
          <KnowledgeHubPanel />
        </div>
        <div className="space-y-6">
          <ChatbotWidget />
          <UsageSummary />
          <RoleGate roles={["Admin"]}>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-1">Admin Controls</h3>
              <p className="text-sm text-foreground/70">
                Manage models and upload/update templates in Knowledge Hub.
              </p>
            </div>
          </RoleGate>
        </div>
      </div>
    </div>
  );
}
