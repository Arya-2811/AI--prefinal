import { Code } from "lucide-react";

export default function KnowledgeHubPanel() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <a
          href="/coding-practice"
          className="rounded-md border p-4 hover:bg-accent hover:text-accent-foreground transition-colors bg-gradient-to-r from-primary/5 to-indigo-100/30 block"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-medium text-lg">Built-in Coding Practice</div>
              <div className="text-sm text-foreground/70">10 curated coding problems with AI-powered editor</div>
              <div className="text-xs text-primary mt-1">Arrays • Strings • Trees • Dynamic Programming</div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
