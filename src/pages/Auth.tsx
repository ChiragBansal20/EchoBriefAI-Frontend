import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import DotField from "@/components/animations/DotField";
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft, Mail, Lock, User, Chrome, AlertCircle } from "lucide-react";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Handle Google OAuth callback
  useEffect(() => {
    if (window.location.pathname === "/auth/callback") {
      const handled = auth.handleGoogleCallback();
      if (handled) {
        toast.success("Signed in with Google!");
        navigate("/profile", { replace: true });
        return;
      }
    }
    const error = searchParams.get("error");
    if (error === "google_denied") toast.error("Google sign-in was cancelled");
    if (error === "google_failed") toast.error("Google sign-in failed. Try email/password instead.");
  }, []);

  useEffect(() => {
    if (!loading && user) navigate("/profile", { replace: true });
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email     = String(fd.get("email") || "").trim();
    const password  = String(fd.get("password") || "");
    const full_name = String(fd.get("fullName") || "").trim();

    if (!email.includes("@")) { toast.error("Enter a valid email"); return; }
    if (password.length < 6)  { toast.error("Password must be at least 6 characters"); return; }
    if (tab === "signup" && !full_name) { toast.error("Enter your full name"); return; }

    setBusy(true);
    try {
      if (tab === "signup") {
        await auth.register(email, password, full_name);
        toast.success("Account created! Complete your profile.");
      } else {
        await auth.login(email, password);
        toast.success("Welcome back!");
      }
      navigate("/profile");
    } catch (err: any) {
      const msg = err.message || "Authentication failed";
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("NetworkError")) {
        toast.error("Cannot reach backend. Is the server running on port 4000?");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = auth.googleLoginUrl();
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated dot background — respects current theme */}
      <div className="absolute inset-0 pointer-events-none">
        <DotField
          dotRadius={1.5} dotSpacing={16} bulgeStrength={70} glowRadius={200}
          gradientFrom="rgba(248,113,23,0.35)"
          gradientTo="rgba(236,72,153,0.30)"
          glowColor="hsl(var(--primary))"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to EchoBrief
        </Link>

        <Card className="shadow-2xl border-border/60 bg-card/95 backdrop-blur-sm animate-[scale-in_0.3s_ease-out]">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-serif text-3xl">
              Echo<span className="gradient-text">Brief</span> AI
            </CardTitle>
            <CardDescription>Sign in to unlock AI summaries, voice reading & games</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={tab} onValueChange={v => setTab(v as "signin" | "signup")}>
              <TabsList className="grid grid-cols-2 w-full mb-5">
                <TabsTrigger value="signin" className="gap-1.5">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Sign In */}
              <TabsContent value="signin">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input name="email" type="email" placeholder="you@example.com"
                        required autoComplete="email" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input name="password" type={showPass ? "text" : "password"}
                        placeholder="••••••••" required autoComplete="current-password"
                        className="pl-9 pr-10" />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full font-semibold btn-glow" size="lg" disabled={busy}>
                    {busy ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input name="fullName" placeholder="Rahul Sharma"
                        required maxLength={100} autoComplete="name" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input name="email" type="email" placeholder="you@example.com"
                        required autoComplete="email" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password <span className="text-muted-foreground text-xs">(min 6 chars)</span></Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input name="password" type={showPass ? "text" : "password"}
                        placeholder="Create a password" required minLength={6}
                        autoComplete="new-password" className="pl-9 pr-10" />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full font-semibold btn-glow" size="lg" disabled={busy}>
                    {busy ? "Creating account…" : "Create Free Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>

            {/* Google OAuth button */}
            <Button variant="outline" className="w-full gap-2 font-semibold" size="lg"
              onClick={handleGoogle} disabled={busy}>
              <Chrome className="w-4 h-4" />
              Continue with Google
            </Button>

            {/* Setup note for Google OAuth */}
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Google login requires <code className="font-mono">GOOGLE_CLIENT_ID</code> in backend <code className="font-mono">.env</code>. Email/password always works.</span>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By signing up you agree to our{" "}
              <span className="underline cursor-pointer hover:text-foreground">Terms of Service</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
