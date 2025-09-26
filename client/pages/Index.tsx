import { DemoResponse } from "@shared/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/services/auth-context";
import { useNavigate } from "react-router-dom";
import { Code, Sparkles, Zap, Users, Brain, Rocket, Play, ChevronRight, Star, GitBranch, Terminal, Bot } from "lucide-react";

export default function Index() {
  const { user } = useAuth();

  useEffect(() => { 
    document.title = "Lazy AI — AI-Powered Coding Assistant"; 
    
    // Check if URL has #auth hash and scroll to auth section
    if (window.location.hash === '#auth') {
      setTimeout(() => {
        const authSection = document.getElementById('auth');
        if (authSection) {
          authSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-indigo-50/50 to-purple-50/30" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium animate-bounce">
              <Sparkles className="w-4 h-4" />
              Powered by Gemini 2.0 AI
            </div>
            
            {/* Main Heading with Gradient */}
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Code Smarter
              </span>
              <br />
              <span className="text-foreground">Build Faster</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              The ultimate AI-powered coding platform with intelligent autocomplete, 
              collaborative snippets, and real-time assistance.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button 
                onClick={() => {
                  if (user) {
                    // User is authenticated, go to dashboard
                    window.location.href = '/dashboard';
                  } else {
                    // User not authenticated, scroll to sign-in section
                    const authSection = document.getElementById('auth');
                    if (authSection) {
                      authSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                {user ? 'Launch Dashboard' : 'Get Started'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#demo" 
                className="group inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </a>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
              <StatCard number="10k+" label="Lines of Code" icon={<Code className="w-6 h-6" />} />
              <StatCard number="500+" label="AI Snippets" icon={<Brain className="w-6 h-6" />} />
              <StatCard number="99.9%" label="Uptime" icon={<Zap className="w-6 h-6" />} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Supercharge Your Development</h2>
            <p className="text-xl text-foreground/70">Everything you need to code like a pro</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="w-8 h-8" />}
              title="AI Code Assistant"
              description="Smart autocomplete, syntax highlighting, and real-time error detection powered by Gemini 2.0"
              gradient="from-blue-500 to-indigo-600"
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Team Collaboration"
              description="Share code snippets in real-time, collaborate seamlessly with your team"
              gradient="from-green-500 to-emerald-600"
            />
            <FeatureCard 
              icon={<Bot className="w-8 h-8" />}
              title="AI Chatbot"
              description="Get instant coding help, best practices, and solutions with voice input support"
              gradient="from-purple-500 to-pink-600"
            />
            <FeatureCard 
              icon={<Terminal className="w-8 h-8" />}
              title="Code Execution"
              description="Run Python, C++, Java, and JavaScript code with interactive input support"
              gradient="from-orange-500 to-red-600"
            />
            <FeatureCard 
              icon={<GitBranch className="w-8 h-8" />}
              title="Smart Snippets"
              description="AI-curated code snippets with difficulty levels and smart search"
              gradient="from-teal-500 to-cyan-600"
            />
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8" />}
              title="Analytics"
              description="Track usage, performance metrics, and team productivity insights"
              gradient="from-violet-500 to-purple-600"
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-xl text-foreground/70">Experience the power of AI-assisted coding</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-gray-400 text-sm">Lazy AI Assistant</span>
              </div>
              
              {/* Code Demo */}
              <div className="p-6 font-mono text-sm">
                <div className="text-green-400">$ lazy-ai --start</div>
                <div className="text-blue-400 mt-2">🚀 AI Coding Assistant initialized...</div>
                <div className="text-gray-300 mt-1">✓ Smart autocomplete enabled</div>
                <div className="text-gray-300">✓ Real-time collaboration ready</div>
                <div className="text-gray-300">✓ Gemini 2.0 AI connected</div>
                <div className="text-yellow-400 mt-3 animate-pulse">▶ Ready to code smarter!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth" className="py-20 bg-gradient-to-r from-primary/5 to-indigo-100/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <AuthCard />
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">Join the Future of Coding</h3>
              <div className="space-y-4">
                <BenefitItem icon={<Star className="w-5 h-5" />} text="Role-based access control (Developer, Team Lead, Admin)" />
                <BenefitItem icon={<Zap className="w-5 h-5" />} text="Real-time collaboration with searchable history" />
                <BenefitItem icon={<Brain className="w-5 h-5" />} text="AI-powered knowledge hub with smart templates" />
                <BenefitItem icon={<Bot className="w-5 h-5" />} text="Intelligent chatbot with voice input support" />
                <BenefitItem icon={<GitBranch className="w-5 h-5" />} text="Advanced analytics with CSV/PDF export" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// New component functions
function StatCard({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="text-center group hover:scale-105 transition-transform duration-300">
      <div className="flex justify-center mb-2 text-primary group-hover:animate-bounce">
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground">{number}</div>
      <div className="text-sm text-foreground/60">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-foreground/70 leading-relaxed">{description}</p>
    </div>
  );
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <p className="text-foreground/80 group-hover:text-foreground transition-colors">{text}</p>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border p-4 bg-secondary/30">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-foreground/70">{desc}</div>
    </div>
  );
}

function AuthCard() {
  const { user, signin, signup, signout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Developer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); 
    setError(null);
    setLoading(true);
    
    try {
      if (mode === "login") {
        await signin(email, password);
      } else {
        await signup(name, email, password, role as any);
      }
      
      setName(""); 
      setEmail(""); 
      setPassword("");
      
      // Redirect to dashboard after successful authentication
      navigate("/dashboard");
    } catch (err: any) { 
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{user ? "Account" : mode === "login" ? "Login" : "Sign up"}</h3>
        {!user && (
          <div className="bg-secondary rounded p-1 text-sm">
            <button onClick={() => setMode("login")} className={"px-3 py-1 rounded " + (mode === "login" ? "bg-primary text-primary-foreground" : "")}>Login</button>
            <button onClick={() => setMode("signup")} className={"px-3 py-1 rounded " + (mode === "signup" ? "bg-primary text-primary-foreground" : "")}>Signup</button>
          </div>
        )}
      </div>
      {user ? (
        <div className="space-y-3">
          <p className="text-sm">Signed in as <span className="font-medium">{user.name}</span> · <span className="uppercase text-xs">{user.role}</span></p>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/dashboard")} 
              className="rounded-md bg-primary text-primary-foreground px-4 py-2"
            >
              Go to Dashboard
            </button>
            <button onClick={signout} className="rounded-md border px-4 py-2">Logout</button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <>
              <input className="w-full rounded-md border px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <div className="flex gap-2">
                <label className="text-sm pt-2">Role</label>
                <select className="rounded-md border px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option>Developer</option><option>Team Lead</option><option>Admin</option>
                </select>
              </div>
            </>
          )}
          <input className="w-full rounded-md border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full rounded-md border px-3 py-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? "Signing in..." : (mode === "login" ? "Login" : "Create account")}
          </button>
          <p className="text-xs text-foreground/60">Tip: use admin@lazy-ai.local / admin for an Admin demo account.</p>
        </form>
      )}
    </div>
  );
}
