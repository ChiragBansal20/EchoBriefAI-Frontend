// EchoBrief AI — News aggregator using Google News RSS (no API key needed)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOPIC_QUERY: Record<string, string> = {
  general: "world",
  world: "world",
  business: "business",
  technology: "technology",
  sports: "sports",
  entertainment: "entertainment",
  science: "science",
  health: "health",
  india: "India",
};

interface Article {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  image: string;
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function stripHtml(s: string): string {
  return decode(s).replace(/<[^>]+>/g, "").trim();
}

function fallbackImage(topic: string): string {
  const labels: Record<string, string> = {
    general: "Top Stories", world: "World News", business: "Business",
    technology: "Technology", sports: "Sports", entertainment: "Entertainment",
    science: "Science", health: "Health", india: "India",
  };
  const accents: Record<string, string> = {
    general: "210 82% 55%", world: "174 62% 44%", business: "43 86% 54%",
    technology: "258 72% 62%", sports: "142 64% 45%", entertainment: "333 76% 58%",
    science: "188 78% 45%", health: "353 74% 58%", india: "28 88% 55%",
  };
  const label = labels[topic] || "News";
  const accent = accents[topic] || accents.general;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${accent})"/><stop offset="1" stop-color="hsl(222 47% 11%)"/></linearGradient><pattern id="p" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M0 32h64M32 0v64" stroke="hsl(0 0% 100% / .16)" stroke-width="1"/></pattern></defs><rect width="800" height="500" fill="url(#g)"/><rect width="800" height="500" fill="url(#p)"/><circle cx="650" cy="110" r="120" fill="hsl(0 0% 100% / .14)"/><text x="56" y="82" fill="hsl(0 0% 100% / .72)" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3">ECHOBRIEF</text><text x="56" y="282" fill="hsl(0 0% 100%)" font-family="Arial, sans-serif" font-size="66" font-weight="800">${label}</text><text x="56" y="340" fill="hsl(0 0% 100% / .78)" font-family="Arial, sans-serif" font-size="28" font-weight="500">Latest verified headlines</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function unsplashFor(topic: string, title: string): string {
  const stop = new Set(["the","a","an","and","or","of","in","on","to","for","with","is","are","was","were","by","at","from","as","that","this","it","be","after","before","over","under","new","says","said"]);
  const kws = title.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
    .filter(w => w.length > 3 && !stop.has(w)).slice(0, 3);
  const terms = [topic, ...kws].filter(Boolean).join(",");
  return `https://source.unsplash.com/800x500/?${encodeURIComponent(terms || "news")}`;
}

// Try to extract image from RSS item block (media:content, media:thumbnail, enclosure, img in description)
function extractRssImage(block: string): string | null {
  const patterns = [
    /<media:content[^>]+url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
    /<enclosure[^>]+url=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i,
  ];
  for (const p of patterns) {
    const m = block.match(p);
    if (m && m[1] && !m[1].includes("gstatic.com/images")) return m[1];
  }
  return null;
}

// Fetch publisher page, follow redirects from Google News, extract og:image
async function fetchOgImage(url: string, signal: AbortSignal): Promise<string | null> {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal,
    });
    if (!r.ok) return null;
    // Read only first ~80KB to find meta tags quickly
    const reader = r.body?.getReader();
    if (!reader) return null;
    const decoder = new TextDecoder();
    let html = "";
    let total = 0;
    while (total < 120_000) {
      const { value, done } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      total += value.length;
      if (html.includes("</head>")) break;
    }
    try { await reader.cancel(); } catch { /* ignore */ }

    const patterns = [
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
      /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m && m[1]) {
        let img = decode(m[1]);
        if (img.startsWith("//")) img = "https:" + img;
        if (img.startsWith("http")) return img;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await p;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function enrichImage(article: Article, signal: AbortSignal): Promise<void> {
  if (article.image && !article.image.startsWith("data:")) return;
  const og = await fetchOgImage(article.url, signal);
  if (og) {
    article.image = og;
    return;
  }
  // unsplash fallback (will be tried by browser; SVG remains as ultimate fallback)
  // We keep the SVG here so the response always has a usable URL; frontend will
  // additionally try unsplash via onError if needed.
}

function parseRss(xml: string, topic: string): Article[] {
  const items = xml.split("<item>").slice(1);
  const out: Article[] = [];
  for (const raw of items) {
    const block = raw.split("</item>")[0];
    const get = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
      const m = block.match(r);
      return m ? m[1] : "";
    };
    const title = stripHtml(get("title"));
    const link = stripHtml(get("link"));
    const pub = stripHtml(get("pubDate"));
    const descRaw = get("description");
    const desc = stripHtml(descRaw);
    const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const source = sourceMatch ? stripHtml(sourceMatch[1]) : "Google News";
    if (!title || !link) continue;
    const rssImg = extractRssImage(block) || extractRssImage(descRaw);
    out.push({
      title,
      description: desc.split(" ").slice(0, 40).join(" "),
      url: link,
      source,
      publishedAt: pub,
      image: rssImg || fallbackImage(topic),
    });
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const topic = (url.searchParams.get("topic") || "general").toLowerCase();
    const lang = url.searchParams.get("lang") || "en";
    const country = url.searchParams.get("country") || (lang === "hi" ? "IN" : "US");
    const max = Math.min(parseInt(url.searchParams.get("max") || "12", 10), 30);
    const search = url.searchParams.get("q");

    const ceid = `${country}:${lang}`;
    const q = search || TOPIC_QUERY[topic] || topic;

    // BBC topic-specific RSS (reliable, includes media:thumbnail)
    const BBC: Record<string, string> = {
      general: "https://feeds.bbci.co.uk/news/rss.xml",
      world: "https://feeds.bbci.co.uk/news/world/rss.xml",
      business: "https://feeds.bbci.co.uk/news/business/rss.xml",
      technology: "https://feeds.bbci.co.uk/news/technology/rss.xml",
      sports: "https://feeds.bbci.co.uk/sport/rss.xml",
      entertainment: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
      science: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
      health: "https://feeds.bbci.co.uk/news/health/rss.xml",
      india: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
    };

    const feeds = [
      `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${lang}&gl=${country}&ceid=${ceid}`,
      `https://news.google.com/rss?hl=${lang}&gl=${country}&ceid=${ceid}`,
      BBC[topic] || BBC.general,
      `https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en`,
    ];

    let xml = "";
    let lastErr = "";
    for (const feed of feeds) {
      try {
        const r = await fetch(feed, {
          headers: { "User-Agent": UA, "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8" },
        });
        if (r.ok) { xml = await r.text(); break; }
        lastErr = `Feed ${r.status}`;
      } catch (err) {
        lastErr = (err as Error).message;
      }
    }

    const articles = xml ? parseRss(xml, topic).slice(0, max) : [];

    // Enrich in parallel with a global timeout so the function stays responsive
    if (articles.length) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      await Promise.allSettled(articles.map((a) => enrichImage(a, ctrl.signal)));
      clearTimeout(timer);
      // For any still on the SVG placeholder, fall back to topic-keyword Unsplash URL
      for (const a of articles) {
        if (a.image.startsWith("data:")) {
          a.image = unsplashFor(topic, a.title);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: articles.length > 0,
        topic, lang,
        count: articles.length,
        articles,
        ...(articles.length === 0 ? { error: lastErr || "No articles", fallback: true } : {}),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: (e as Error).message, fallback: true, articles: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
