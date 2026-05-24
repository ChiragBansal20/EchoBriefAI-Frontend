import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { news, bookmarks, getAccessToken, proxyImage } from "@/lib/api";
import type { Article } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles, ExternalLink, Loader2, Bookmark, BookmarkCheck,
  Share2, Volume2, VolumeX, Search, X, TrendingUp, Clock, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";
import { LogoLoop } from "@/components/animations/LogoLoop";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type { Article };

const CATEGORIES = [
  { id: "general",       label: "Top Stories" },
  { id: "india",         label: "🇮🇳 India" },
  { id: "world",         label: "World" },
  { id: "business",      label: "Business" },
  { id: "technology",    label: "Tech" },
  { id: "sports",        label: "Sports" },
  { id: "entertainment", label: "Entertainment" },
  { id: "science",       label: "Science" },
  { id: "health",        label: "Health" },
];

const TRENDING = [
  "AI Breakthroughs","T20 World Cup","Budget 2026",
  "Climate Summit","Tech IPOs","Space Missions","Health Research","India Economy",
];

const TICKER = [
  "⚡ AI-Powered Summaries","🎙️ Voice Read Aloud","🌍 Verified Sources",
  "🇮🇳 India Coverage","📱 Real-time Updates","🔖 Save Articles",
  "🎮 Daily Games","🏆 Leaderboard","🌐 11 Languages",
];

/* ── Smart image — 3-stage fallback ─────────────────────────────────────────── */
function NewsImg({ src, alt, className }: { src:string; alt:string; className?:string }) {
  const [cur, setCur] = useState(src || "");
  const stage = useRef(0);
  useEffect(() => { setCur(src || ""); stage.current = 0; }, [src]);
  const onErr = () => {
    if (stage.current === 0) { stage.current = 1; setCur(proxyImage(src)); }
    else if (stage.current === 1) { stage.current = 2; setCur("https://source.unsplash.com/800x450/?news,newspaper,journalism"); }
    else {
      stage.current = 3;
      setCur("data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">' +
        '<rect width="800" height="450" fill="#1e293b"/>' +
        '<text x="400" y="190" text-anchor="middle" fill="#94a3b8" font-size="72">📰</text>' +
        '<text x="400" y="265" text-anchor="middle" fill="#64748b" font-size="22" font-family="sans-serif">News Article</text>' +
        '</svg>'
      ));
    }
  };
  return <img src={cur} alt={alt} className={className} onError={onErr} loading="lazy" />;
}

/* ── Voice hook — properly handles Chrome's async voice loading ──────────────── */
function useVoices() {
  const [voices, setVoices]       = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected]   = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking]   = useState<number | null>(null);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (!v.length) return;
      setVoices(v);
      setSelected(prev => {
        if (prev) return prev; // keep existing selection
        // prefer Indian English, then any English, then first available
        return (
          v.find(x => /en.IN|en_IN/i.test(x.lang)) ||
          v.find(x => /en.US|en_US/i.test(x.lang)) ||
          v.find(x => /^en/i.test(x.lang)) ||
          v[0]
        );
      });
    };

    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);

    // Polling fallback for Firefox / Safari
    const iv = setInterval(() => {
      if (window.speechSynthesis.getVoices().length) { load(); clearInterval(iv); }
    }, 100);
    const tv = setTimeout(() => clearInterval(iv), 5000);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      clearInterval(iv);
      clearTimeout(tv);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((idx: number, text: string) => {
    if (!("speechSynthesis" in window)) { toast.error("Voice not supported in this browser"); return; }

    // Toggle off
    if (speaking === idx) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    if (selected) utt.voice = selected;
    utt.rate  = 0.93;
    utt.pitch = 1;
    utt.lang  = selected?.lang || "en-US";

    utt.onstart = () => setSpeaking(idx);
    utt.onend   = () => setSpeaking(null);
    utt.onerror = () => setSpeaking(null);

    uttRef.current = utt;
    setSpeaking(idx);

    // Chrome bug: speech pauses after ~15s — keepAlive workaround
    window.speechSynthesis.speak(utt);

    // Chrome workaround: resume every 10s to prevent pause
    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) { clearInterval(keepAlive); return; }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10000);

    utt.onend = () => { clearInterval(keepAlive); setSpeaking(null); };
    utt.onerror = () => { clearInterval(keepAlive); setSpeaking(null); };
  }, [speaking, selected]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(null);
  }, []);

  return { voices, selected, setSelected, speaking, speak, stop };
}

/* ── Main component ────────────────────────────────────────────────────────── */
export const NewsFeed = ({ lang }: { lang: string }) => {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [topic, setTopic]             = useState(searchParams.get("topic") || "general");
  const [articles, setArticles]       = useState<Article[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [summarizingIdx, setSummarizingIdx] = useState<number | null>(null);
  const [summaries, setSummaries]     = useState<Record<number, string>>({});
  const [savedUrls, setSavedUrls]     = useState<Set<string>>(new Set());
  const [savingUrl, setSavingUrl]     = useState<string | null>(null);
  const [bkIds, setBkIds]             = useState<Record<string, string>>({});

  const { voices, selected: selVoice, setSelected: setSelVoice, speaking, speak, stop } = useVoices();

  /* sync topic from URL */
  useEffect(() => {
    const tp = searchParams.get("topic");
    if (tp && tp !== topic) setTopic(tp);
  }, [searchParams]);

  /* fetch articles */
  useEffect(() => {
    let dead = false;
    setLoading(true);
    setSummaries({});
    stop();
    news.fetch({ topic, lang, max: 12, q: activeQuery || undefined })
      .then(d => { if (!dead) setArticles(d.articles || []); })
      .catch(() => toast.error(t("could_not_load")))
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  }, [topic, lang, activeQuery]);

  /* load bookmarks */
  useEffect(() => {
    if (!getAccessToken()) return;
    bookmarks.list().then(d => {
      const urls = new Set<string>((d.bookmarks || []).map((b: any) => b.article_url));
      const ids: Record<string, string> = {};
      (d.bookmarks || []).forEach((b: any) => { ids[b.article_url] = b.id; });
      setSavedUrls(urls); setBkIds(ids);
    }).catch(() => {});
  }, []);

  const switchTopic = (id: string) => {
    setTopic(id); setActiveQuery(""); setSearch("");
    setSearchParams({ topic: id }); stop();
  };

  /* AI Summary */
  const summarize = async (idx: number) => {
    const a = articles[idx];
    if (!a || summarizingIdx !== null) return;
    setSummarizingIdx(idx);
    try {
      const d = await news.summarize(`${a.title}. ${a.description}`, a.title);
      setSummaries(s => ({ ...s, [idx]: d.summary }));
      toast.success(`Summary ready! (via ${d.provider || "AI"})`);
    } catch (e: any) { toast.error(e.message || "Summary failed"); }
    finally { setSummarizingIdx(null); }
  };

  /* Bookmark */
  const toggleBookmark = async (a: Article) => {
    if (!getAccessToken()) { toast.info("Sign in to save articles"); return; }
    setSavingUrl(a.url);
    try {
      if (savedUrls.has(a.url)) {
        const id = bkIds[a.url];
        if (id) await bookmarks.remove(id);
        setSavedUrls(s => { const n = new Set(s); n.delete(a.url); return n; });
        toast.success("Bookmark removed");
      } else {
        const d = await bookmarks.save({ article_url: a.url, title: a.title, description: a.description, image: a.image, source: a.source, topic });
        setSavedUrls(s => new Set([...s, a.url]));
        if (d.bookmark?.id) setBkIds(ids => ({ ...ids, [a.url]: d.bookmark.id }));
        toast.success("Article saved!");
      }
    } catch (e: any) { toast.error(e.message || "Could not save"); }
    setSavingUrl(null);
  };

  /* Share */
  const share = async (a: Article) => {
    if (navigator.share) { await navigator.share({ title: a.title, url: a.url }).catch(() => {}); }
    else { await navigator.clipboard.writeText(a.url).catch(() => {}); toast.success("Link copied!"); }
  };

  const featured = articles[0];
  const rest     = articles.slice(1);

  const tickerLogos = TICKER.map(l => ({
    node: <span className="text-xs font-semibold text-foreground/70 whitespace-nowrap px-1">{l}</span>,
  }));

  /* ── Card action bar (reused for both featured & grid) ── */
  const ActionBar = ({ a, idx, size = "sm" }: { a: Article; idx: number; size?: "sm"|"lg" }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button size={size} onClick={() => summarize(idx)} disabled={summarizingIdx === idx}
        className={`gap-1.5 ${size === "lg" ? "" : "h-7 px-2 text-xs"}`}>
        {summarizingIdx === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {size === "lg" ? "AI Summary" : <span className="hidden sm:inline">Summary</span>}
      </Button>
      <Button size={size} variant="outline" onClick={() => speak(idx, `${a.title}. ${a.description}`)}
        className={`gap-1.5 ${size === "lg" ? "" : "h-7 px-2"}`}
        title={speaking === idx ? "Stop reading" : "Listen to article"}>
        {speaking === idx ? <VolumeX className="w-3.5 h-3.5 text-primary" /> : <Volume2 className="w-3.5 h-3.5" />}
        {size === "lg" && (speaking === idx ? "Stop" : "Listen")}
      </Button>
      <Button size={size} variant="ghost" onClick={() => toggleBookmark(a)} disabled={savingUrl === a.url}
        className={size === "lg" ? "gap-1.5" : "h-7 px-2"} title="Save article">
        {savedUrls.has(a.url) ? <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> : <Bookmark className="w-3.5 h-3.5" />}
      </Button>
      <Button size={size} variant="ghost" onClick={() => share(a)}
        className={size === "lg" ? "gap-1.5" : "h-7 px-2"} title="Share">
        <Share2 className="w-3.5 h-3.5" />
      </Button>
      {size === "lg" && (
        <Button size={size} variant="ghost" asChild className="ml-auto gap-1.5">
          <a href={a.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" /> Read
          </a>
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">

      {/* ── Ticker ── */}
      <div className="border-b border-border bg-secondary/40 py-2.5 overflow-hidden">
        <LogoLoop logos={tickerLogos} speed={38} gap={48} logoHeight={16}
          fadeOut fadeOutColor="hsl(var(--background))" pauseOnHover />
      </div>

      {/* ── Category tabs — no container, full-width scroll ── */}
      <div className="bg-card border-b border-border sticky top-[72px] z-40 shadow-sm">
        <div className="flex overflow-x-auto px-2"
          style={{ scrollbarWidth:"none", msOverflowStyle:"none" }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => switchTopic(c.id)}
              className={`whitespace-nowrap flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                topic === c.id && !activeQuery
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Controls bar: trending + voice + search ── */}
      <div className="border-b border-border bg-secondary/20">
        <div className="px-3 py-2.5 flex items-center gap-2">

          {/* Trending label */}
          <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> Trending:
          </span>

          {/* Trending tags — horizontal scroll */}
          <div className="flex gap-1.5 overflow-x-auto flex-1 min-w-0"
            style={{ scrollbarWidth:"none", msOverflowStyle:"none" }}>
            {TRENDING.map(tag => (
              <button key={tag} onClick={() => { setActiveQuery(tag); setSearch(tag); }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all whitespace-nowrap flex-shrink-0 ${
                  activeQuery === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary bg-background"
                }`}>
                {tag}
              </button>
            ))}
          </div>

          {/* Voice dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border
                text-xs text-muted-foreground hover:border-primary hover:text-primary
                transition-all bg-background flex-shrink-0">
                {speaking !== null
                  ? <VolumeX className="w-3.5 h-3.5 text-primary" />
                  : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline max-w-[72px] truncate">
                  {voices.length === 0 ? "Voice" : (selVoice?.name.split(" ")[0] || "Voice")}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto z-[60] w-64">
              {voices.length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                  <Volume2 className="w-5 h-5 mx-auto mb-1 opacity-40" />
                  No voices loaded yet.<br />Try clicking an article's Listen button first.
                </div>
              ) : (
                voices.map(v => (
                  <DropdownMenuItem key={v.name} onClick={() => setSelVoice(v)}
                    className={`cursor-pointer text-xs ${selVoice?.name === v.name ? "bg-primary/10 text-primary font-semibold" : ""}`}>
                    <Volume2 className="w-3 h-3 mr-2 flex-shrink-0 opacity-50" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{v.name}</p>
                      <p className="text-[10px] text-muted-foreground">{v.lang}</p>
                    </div>
                    {selVoice?.name === v.name && <span className="ml-2 text-primary">✓</span>}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <form onSubmit={e => { e.preventDefault(); setActiveQuery(search.trim()); }}
            className="flex items-center gap-1 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="pl-8 pr-7 py-1.5 text-xs rounded-lg border border-input bg-background
                  focus:outline-none focus:ring-2 focus:ring-primary/30 w-28 sm:w-40" />
              {search && (
                <button type="button" onClick={() => { setSearch(""); setActiveQuery(""); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <Button type="submit" size="sm" variant="secondary" className="h-7 px-2.5 text-xs flex-shrink-0">Go</Button>
          </form>

          {activeQuery && (
            <button onClick={() => { setActiveQuery(""); setSearch(""); }}
              className="text-xs text-primary hover:underline flex items-center gap-1 flex-shrink-0">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Articles ── */}
      <main className="container py-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📰</p>
            <p className="text-muted-foreground text-lg">{t("no_articles")}</p>
            {activeQuery && (
              <button onClick={() => { setActiveQuery(""); setSearch(""); }}
                className="mt-3 text-primary hover:underline text-sm">Clear search</button>
            )}
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <div className="mb-8 rounded-xl overflow-hidden border border-border shadow-xl bg-card group article-card">
                <div className="grid md:grid-cols-5">
                  <div className="md:col-span-3 overflow-hidden relative">
                    <a href={featured.url} target="_blank" rel="noopener noreferrer">
                      <NewsImg src={featured.image} alt={featured.title}
                        className="w-full h-56 md:h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </a>
                    {(featured as any).readingTime && (
                      <span className="absolute top-3 left-3 flex items-center gap-1 text-[11px] bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                        <Clock className="w-3 h-3" /> {(featured as any).readingTime} min
                      </span>
                    )}
                    {speaking === 0 && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full animate-pulse">
                        <Volume2 className="w-3 h-3" /> Reading aloud…
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 p-6 flex flex-col gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="byline text-primary">{featured.source}</span>
                        {featured.publishedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(featured.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <a href={featured.url} target="_blank" rel="noopener noreferrer">
                        <h2 className="headline text-2xl md:text-3xl hover:text-primary transition-colors">
                          {featured.title}
                        </h2>
                      </a>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                        {featured.description}
                      </p>
                    </div>
                    {summaries[0] && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm whitespace-pre-line animate-fade-in">
                        {summaries[0]}
                      </div>
                    )}
                    <ActionBar a={featured} idx={0} size="lg" />
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
              {rest.map((a, i) => {
                const idx = i + 1;
                return (
                  <article key={a.url + i} className="article-card flex flex-col group">
                    <div className="relative overflow-hidden">
                      <a href={a.url} target="_blank" rel="noopener noreferrer">
                        <NewsImg src={a.image} alt={a.title}
                          className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105" />
                      </a>
                      {(a as any).readingTime && (
                        <span className="absolute bottom-2 right-2 flex items-center gap-0.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                          <Clock className="w-2.5 h-2.5" /> {(a as any).readingTime}m
                        </span>
                      )}
                      {speaking === idx && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary/90 text-white text-xs px-3 py-1.5 rounded-full animate-pulse flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5" /> Reading…
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="byline text-primary truncate">{a.source}</span>
                        {a.publishedAt && (
                          <span className="text-[11px] text-muted-foreground ml-auto flex-shrink-0">
                            {new Date(a.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <a href={a.url} target="_blank" rel="noopener noreferrer">
                        <h3 className="headline text-base hover:text-primary transition-colors line-clamp-3 mb-2">
                          {a.title}
                        </h3>
                      </a>
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{a.description}</p>
                      {summaries[idx] && (
                        <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs whitespace-pre-line animate-fade-in">
                          {summaries[idx]}
                        </div>
                      )}
                      <div className="mt-3 pt-2 border-t border-border/50">
                        <ActionBar a={a} idx={idx} size="sm" />
                      </div>
                      <a href={a.url} target="_blank" rel="noopener noreferrer"
                        className="mt-1.5 self-end text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5">
                        Read full <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
