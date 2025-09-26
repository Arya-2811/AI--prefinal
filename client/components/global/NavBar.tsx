import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/services/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const NavLink = ({ to, label }: { to: string; label: string }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {label}
    </Link>
  );
};

export default function NavBar() {
  const { user, signout, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block h-8 w-8 rounded-md bg-gradient-to-br from-primary to-indigo-500" />
          <span className="text-lg font-bold tracking-tight">CodePilot AI</span>
        </Link>
        
        <nav className="flex items-center gap-1">
          <NavLink to="/" label="Home" />
          
          {/* Show Dashboard link only for authenticated users */}
          {user && <NavLink to="/dashboard" label="Dashboard" />}
          
          {/* Authentication UI */}
          {!loading && (
            <div className="flex items-center gap-2 ml-4">
              {user ? (
                // Authenticated user UI
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-accent/50">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                // Guest user UI
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      // If we're on the home page, scroll to auth section
                      if (window.location.pathname === '/') {
                        const authSection = document.getElementById('auth');
                        if (authSection) {
                          authSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      } else {
                        // If we're on another page, navigate to home page with hash
                        window.location.href = '/#auth';
                      }
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
