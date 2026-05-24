import { Link, useLocation, useNavigate } from "react-router-dom";
import { Newspaper, Gamepad2, Moon, Sun, LogIn, LogOut, User, Globe, ChevronDown, Crown, Home, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { LANGUAGES } from "@/lib/i18n";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SiteHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useI18n();
  // Read from html class (set by inline script in index.html before React mounts)
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const currentLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  const isActive = (to: string, exact = false) =>
    exact ? pathname === to : (to !== "/" && pathname.startsWith(to));

  const handleUpgrade = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    if (pathname === "/") {
      document.getElementById("upgrade")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/?scroll=upgrade");
    }
  };

  const today = new Date().toLocaleDateString(
    lang === "en" ? "en-US" : `${lang}-IN`,
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <header className="border-b border-border bg-background/95 sticky top-0 z-50 backdrop-blur-md shadow-sm">

      {/* ── Top utility bar ── */}
      <div className="border-b border-border bg-secondary/50">
        <div className="container flex items-center justify-between py-1.5">

          {/* Date + Live */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline byline">{today}</span>
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]"
              style={{ color: "hsl(var(--live))" }}>
              <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: "hsl(var(--live))" }} />
              {t("live")}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">

            {/* ── Language Dropdown ── */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold
                  hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden xs:inline">{currentLang.native}</span>
                  <span className="xs:hidden">{currentLang.code.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto z-[70] w-52 p-1">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Select Language
                </div>
                <DropdownMenuSeparator />
                {LANGUAGES.map(l => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => { setLang(l.code); }}
                    className={`cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                      lang === l.code ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                    }`}
                  >
                    <span className="flex-1">
                      <span className="font-semibold block">{l.native}</span>
                      <span className="text-[11px] text-muted-foreground">{l.label}</span>
                    </span>
                    {lang === l.code && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark / Light toggle */}
            <button onClick={() => setDark(d => !d)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme">
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main header row ── */}
      <div className="container flex items-center justify-between py-3">

        {/* Brand */}
        <Link to="/" className="flex flex-col group flex-shrink-0">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-tight leading-none
            text-[hsl(var(--headline))] transition-transform group-hover:scale-[1.02] origin-left">
            Echo<span className="gradient-text">Brief</span>&nbsp;AI
          </h1>
          <span className="byline mt-0.5 hidden sm:block">{t("brand_tag")}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Button asChild variant={pathname === "/" ? "default" : "ghost"} size="sm">
            <Link to="/"><Home className="w-4 h-4 mr-1.5" />Home</Link>
          </Button>
          <Button asChild variant={isActive("/news") ? "default" : "ghost"} size="sm">
            <Link to="/news"><Newspaper className="w-4 h-4 mr-1.5" />{t("nav_news")}</Link>
          </Button>
          <Button asChild variant={isActive("/games") ? "default" : "ghost"} size="sm">
            <Link to="/games"><Gamepad2 className="w-4 h-4 mr-1.5" />{t("nav_games")}</Link>
          </Button>
          <button onClick={handleUpgrade}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold
              text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
            <Crown className="w-4 h-4" /> Upgrade
          </button>
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile"><User className="w-4 h-4 mr-1.5" />{t("nav_profile")}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate("/"))}>
                <LogOut className="w-4 h-4 mr-1.5" />{t("nav_signout")}
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm" className="btn-glow">
              <Link to="/auth"><LogIn className="w-4 h-4 mr-1.5" />{t("nav_signin")}</Link>
            </Button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-md hover:bg-muted" onClick={() => setMobileOpen(o => !o)}>
          <div className="w-5 flex flex-col gap-[5px]">
            <span className={`h-0.5 bg-foreground rounded transition-all ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`h-0.5 bg-foreground rounded transition-all ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 bg-foreground rounded transition-all ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </div>
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-md">
          <div className="container py-3 flex flex-col gap-1">
            {[
              { to: "/",      label: "Home",        Icon: Home,      exact: true },
              { to: "/news",  label: t("nav_news"), Icon: Newspaper, exact: false },
              { to: "/games", label: t("nav_games"),Icon: Gamepad2,  exact: false },
            ].map(({ to, label, Icon, exact }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  (exact ? pathname === to : isActive(to))
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            <button onClick={handleUpgrade}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-500 hover:bg-amber-500/10 transition-colors text-left">
              <Crown className="w-4 h-4" /> Upgrade to Pro
            </button>

            {/* Language in mobile */}
            <div className="px-3 pt-2 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Language</p>
              <div className="grid grid-cols-3 gap-1">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-all ${
                      lang === l.code ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-muted"
                    }`}>
                    {l.native}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border mt-1 pt-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors">
                    <User className="w-4 h-4" /> {t("nav_profile")}
                  </Link>
                  <button onClick={() => { setMobileOpen(false); signOut().then(() => navigate("/")); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors text-left">
                    <LogOut className="w-4 h-4" /> {t("nav_signout")}
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground">
                  <LogIn className="w-4 h-4" /> {t("nav_signin")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
