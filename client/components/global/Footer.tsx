export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 text-sm text-foreground/70 flex flex-col md:flex-row gap-2 items-center justify-between">
        <p>
          © {new Date().getFullYear()} Lazy AI — AI-Powered Coding Assistant
        </p>
        <p className="flex items-center gap-3">
          <span>Built with</span>
          <span className="inline-flex items-center gap-2">
            <span className="rounded px-2 py-1 bg-accent text-accent-foreground">Builder.io</span>
            <span className="rounded px-2 py-1 bg-accent text-accent-foreground">Docker</span>
            <span className="rounded px-2 py-1 bg-accent text-accent-foreground">Kubernetes</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
