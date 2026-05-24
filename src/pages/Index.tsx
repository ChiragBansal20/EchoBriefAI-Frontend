import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/hooks/useI18n";
import DotField from "@/components/animations/DotField";
import { LogoLoop } from "@/components/animations/LogoLoop";
import { StarBorder } from "@/components/animations/StarBorder";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, Globe2, Briefcase, Cpu, Trophy, Film, FlaskConical,
  HeartPulse, Newspaper, Gamepad2, Sparkles, Zap, Languages,
  Volume2, BookmarkCheck, Share2, Crown, CheckCircle2, Star, Flame,
} from "lucide-react";
import { news, proxyImage } from "@/lib/api";
import type { Article } from "@/lib/api";

const CATEGORY_ICONS: Record<string, any> = {
  general: Newspaper, world: Globe2, business: Briefcase, technology: Cpu,
  sports: Trophy, entertainment: Film, science: FlaskConical, health: HeartPulse, india: Globe2,
};

function FeaturedImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [cur, setCur] = useState(src);
  const stage = useRef(0);
  useEffect(() => { setCur(src); stage.current = 0; }, [src]);
  return (
    <img src={cur} alt={alt} className={className} loading="lazy"
      onError={() => {
        if (stage.current === 0) { stage.current = 1; setCur(proxyImage(src)); }
        else { stage.current = 2; setCur("https://source.unsplash.com/800x450/?news"); }
      }} />
  );
}

const PLANS = [
  {
    name: "Free", price: "₹0", period: "/forever", highlight: false,
    badge: "", btnText: "Get Started", btnTo: "/auth", btnVariant: "outline" as const,
    features: ["12 articles per topic", "Basic AI summary (local)", "All 3 daily games", "Public leaderboard"],
  },
  {
    name: "Pro", price: "₹299", period: "/month", highlight: true,
    badge: "Most Popular", btnText: "Upgrade to Pro", btnTo: "/auth", btnVariant: "default" as const,
    features: ["Unlimited articles", "Groq AI summaries", "Voice read any article", "All 11 languages", "Sync bookmarks", "Ad-free experience"],
  },
  {
    name: "Team", price: "₹799", period: "/month", highlight: false,
    badge: "Best Value", btnText: "Start Free Trial", btnTo: "/auth", btnVariant: "secondary" as const,
    features: ["Everything in Pro", "5 team members", "Team leaderboard", "Priority support", "Custom RSS feeds"],
  },
];

const FEATURES = [
  { icon: Sparkles,     title: "AI Summaries",   desc: "3-bullet summaries instantly",    color: "text-primary" },
  { icon: Volume2,      title: "Voice Reading",  desc: "Pick any system voice",           color: "text-green-500" },
  { icon: Globe2,       title: "11 Languages",   desc: "Hindi, Tamil, Bengali & more",    color: "text-cyan-500" },
  { icon: Trophy,       title: "Daily Games",    desc: "Sudoku · Wordsearch · Crossword", color: "text-yellow-500" },
  { icon: BookmarkCheck,title: "Save Articles",  desc: "Bookmark for later",              color: "text-blue-500" },
  { icon: Share2,       title: "Share Easily",   desc: "One-click share or copy link",    color: "text-pink-500" },
  { icon: Zap,          title: "Real-time",      desc: "Updated every 8 minutes",         color: "text-amber-500" },
  { icon: Flame,        title: "Streaks",        desc: "Build daily reading streaks",     color: "text-orange-500" },
];

const Index = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [featured, setFeatured] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle ?scroll=upgrade when navigated from another page
  useEffect(() => {
    if (searchParams.get("scroll") === "upgrade") {
      const el = document.getElementById("upgrade");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    news.fetch({ topic: "general", lang, max: 3 })
      .then(d => setFeatured((d.articles || []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  // Smooth scroll to #upgrade
  const scrollToUpgrade = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("upgrade");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const categories = [
    { id: "world",         label: t("cat_world") },
    { id: "business",      label: t("cat_business") },
    { id: "technology",    label: t("cat_technology") },
    { id: "sports",        label: t("cat_sports") },
    { id: "entertainment", label: t("cat_entertainment") },
    { id: "science",       label: t("cat_science") },
    { id: "health",        label: t("cat_health") },
    { id: "india",         label: "🇮🇳 India" },
  ];

  const tickerItems = [
    { node: <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"><Sparkles className="w-4 h-4 text-primary" /> AI Summaries</span> },
    { node: <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"><Languages className="w-4 h-4 text-accent" /> 11 Languages</span> },
    { node: <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"><Volume2 className="w-4 h-4 text-green-400" /> Voice Reading</span> },
    { node: <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"><Zap className="w-4 h-4 text-yellow-400" /> Real-time News</span> },
    { node: <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"><Gamepad2 className="w-4 h-4 text-purple-400" /> Daily Games</span> },
    { node: <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"><Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard</span> },
    { node: <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"><BookmarkCheck className="w-4 h-4 text-blue-400" /> Save Articles</span> },
    { node: <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"><Globe2 className="w-4 h-4 text-cyan-400" /> Global Coverage</span> },
    { node: <span className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap"><Crown className="w-4 h-4 text-amber-400" /> Premium Plans</span> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── HERO with DotField ── */}
      <section className="relative overflow-hidden bg-[#0b0717] text-white min-h-[640px] flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <DotField dotRadius={1.5} dotSpacing={14} bulgeStrength={67} glowRadius={220}
            gradientFrom="rgba(168,85,247,0.55)" gradientTo="rgba(236,72,153,0.45)" glowColor="#ec4899" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0717]/40 via-transparent to-[#0b0717] pointer-events-none" />
        <div className="container relative z-10 py-20 md:py-28 text-center">
          <span className="byline text-accent/90 animate-fade-in">{t("hero_eyebrow")}</span>
          <h1 className="font-serif font-bold text-5xl md:text-7xl mt-3 leading-[1.05] animate-fade-in drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
            {t("hero_title")}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in drop-shadow-[0_2px_20px_rgba(0,0,0,0.85)]">
            {t("hero_sub")}
          </p>

          {/* Hero CTAs — all working */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in">
            <Button asChild size="lg" variant="secondary" className="hover-scale font-semibold shadow-lg">
              <Link to="/news">
                <Newspaper className="w-4 h-4 mr-2" />
                {t("hero_cta_news")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="hover-scale font-semibold bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white/20">
              <Link to="/games">
                <Gamepad2 className="w-4 h-4 mr-2" />
                {t("hero_cta_games")}
              </Link>
            </Button>
            <Button size="lg" className="hover-scale font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-black border-0 hover:from-yellow-400 hover:to-amber-400"
              onClick={scrollToUpgrade}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Pro
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 animate-fade-in">
            {[["12+", "News Topics"], ["11", "Languages"], ["3", "Daily Games"], ["∞", "AI Summaries"]].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="font-serif font-bold text-3xl text-white">{n}</div>
                <div className="text-xs text-white/60 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <section className="bg-secondary/30 border-y border-border py-4 overflow-hidden">
        <LogoLoop
          logos={tickerItems}
          speed={45}
          gap={56}
          logoHeight={20}
          fadeOut
          fadeOutColor="hsl(var(--background))"
          scaleOnHover
          ariaLabel="Features"
          className="text-foreground"
        />
      </section>

      {/* ── Featured Articles ── */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="byline text-accent">EchoBrief</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-1">{t("featured_title")}</h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex gap-1">
            <Link to="/news">{t("view_all")} <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0,1,2].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
          </div>
        ) : featured.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{t("no_articles")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {featured.map((a, i) => (
              <StarBorder key={a.url + i} color="hsl(var(--primary) / 0.6)" speed="8s" thickness={1}>
                <a href={a.url} target="_blank" rel="noopener noreferrer"
                  className="block bg-card overflow-hidden h-full group rounded-lg">
                  <div className="overflow-hidden">
                    <FeaturedImg src={a.image} alt={a.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-5">
                    <span className="byline text-accent">{a.source}</span>
                    <h3 className="headline text-xl mt-2 group-hover:text-primary transition-colors line-clamp-3">{a.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                  </div>
                </a>
              </StarBorder>
            ))}
          </div>
        )}

        <div className="text-center mt-6 sm:hidden">
          <Button asChild variant="outline">
            <Link to="/news">View All News <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
          </Button>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-secondary/30 border-y border-border py-12">
        <div className="container">
          <div className="text-center mb-8">
            <span className="byline text-accent">Explore</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-1">{t("categories_title")}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
            {categories.map(c => {
              const Icon = CATEGORY_ICONS[c.id] || Newspaper;
              return (
                <Link key={c.id} to={`/news?topic=${c.id}`}
                  className="group bg-card border border-border rounded-xl p-5 text-center hover-lift hover:border-primary transition-all">
                  <Icon className="w-8 h-8 mx-auto text-primary group-hover:scale-110 transition-transform duration-200" />
                  <p className="mt-3 font-semibold">{c.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Latest news →</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Games preview ── */}
      <section className="container py-14">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in">
            <span className="byline text-accent">Daily Challenge</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-1">{t("games_preview_title")}</h2>
            <p className="mt-3 text-muted-foreground text-lg">{t("games_preview_sub")}</p>
            <ul className="mt-5 space-y-3">
              {[
                ["🧩", "Sudoku",      "+50 pts", "Fill the 9×9 grid"],
                ["🔤", "Word Search",  "+30 pts", "Find hidden words"],
                ["📝", "Crossword",   "+40 pts", "Solve the clues"],
              ].map(([emoji, name, pts, desc]) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <span className="font-semibold">{name}</span>
                    <span className="text-sm text-muted-foreground ml-2">{desc}</span>
                  </div>
                  <span className="ml-auto font-bold text-primary text-sm">{pts}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-6 hover-scale gap-2 font-semibold">
              <Link to="/games">
                <Gamepad2 className="w-4 h-4" /> {t("hero_cta_games")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: t("sudoku"),       pts: "+50", emoji: "🧩", to: "/games" },
              { name: t("word_search"),  pts: "+30", emoji: "🔤", to: "/games" },
              { name: t("crossword"),    pts: "+40", emoji: "📝", to: "/games" },
            ].map(g => (
              <Link key={g.name} to={g.to}>
                <StarBorder color="hsl(var(--accent) / 0.6)" speed="7s">
                  <div className="bg-card rounded-lg p-4 text-center aspect-square flex flex-col justify-center hover-lift cursor-pointer">
                    <div className="text-3xl mb-2">{g.emoji}</div>
                    <p className="font-semibold text-sm">{g.name}</p>
                    <p className="text-xs font-bold text-primary mt-1">{g.pts} pts</p>
                  </div>
                </StarBorder>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upgrade / Pricing ── */}
      <section id="upgrade" className="bg-secondary/30 border-y border-border py-16 scroll-mt-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="byline text-accent">Pricing</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-1">Choose your plan</h2>
            <p className="mt-2 text-muted-foreground">Start free. No credit card required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-center">
            {PLANS.map((plan, i) => (
              <div key={plan.name}
                className={`relative bg-card rounded-2xl p-6 flex flex-col transition-all hover-lift ${
                  plan.highlight
                    ? "border-2 border-primary shadow-2xl shadow-primary/20 scale-105 md:scale-110"
                    : "border border-border"
                }`}>
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${
                    plan.highlight ? "bg-primary text-primary-foreground" : "bg-amber-500 text-black"
                  }`}>
                    {plan.badge}
                  </span>
                )}
                <div className="mb-5">
                  <h3 className="font-bold text-xl">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-serif font-bold text-4xl">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.btnVariant} className="w-full font-semibold" size="lg">
                  <Link to={plan.btnTo}>{plan.btnText}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="container py-14">
        <div className="text-center mb-10">
          <span className="byline text-accent">Why EchoBrief</span>
          <h2 className="font-serif font-bold text-3xl md:text-4xl mt-1">Everything you need</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 stagger-children">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-card border border-border rounded-xl p-5 text-center hover-lift">
              <f.icon className={`w-8 h-8 mx-auto ${f.color} mb-3`} />
              <h4 className="font-semibold text-sm">{f.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10 bg-secondary/20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <h4 className="font-serif font-bold text-foreground text-xl mb-2">
                Echo<span className="gradient-text">Brief</span> AI
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI-curated news, voice reading, and daily games in 11 Indian languages.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Navigate</h4>
              <ul className="space-y-2">
                {[["Home", "/"], ["News", "/news"], ["Games", "/games"], ["Sign In", "/auth"]].map(([l, h]) => (
                  <li key={l}>
                    <Link to={h} className="text-xs text-muted-foreground hover:text-primary transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Categories</h4>
              <ul className="space-y-2">
                {["World", "Technology", "Business", "Sports", "Health"].map(c => (
                  <li key={c}>
                    <Link to={`/news?topic=${c.toLowerCase()}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">{c}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-5 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} EchoBrief AI · Intelligent News & Daily Games
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
