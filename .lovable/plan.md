## Goal
News cards me actual news-related images dikhayein (SVG placeholder ki jagah real photos jo article ke topic se related ho).

## Problem
Abhi `news` edge function Google News RSS use karta hai, jisme description me image rarely hoti hai — isliye sab cards pe same SVG fallback dikhta hai.

## Approach

### 1. Edge function (`supabase/functions/news/index.ts`)
Har article ke liye real image nikalne ke liye multi-step strategy:

- **Step A — RSS media tags**: `<media:content url="...">`, `<media:thumbnail>`, `<enclosure url="...">` parse karein (Google News kabhi-kabhi deta hai).
- **Step B — Description `<img>`**: jo abhi ho raha hai.
- **Step C — Source page Open Graph scrape** (primary fix):
  - Google News link follow karke final publisher URL nikaalein.
  - Publisher page ka HTML `fetch` karein (browser User-Agent ke saath).
  - `<meta property="og:image">`, `<meta name="twitter:image">`, ya pehla bada `<img>` extract karein.
  - Parallel `Promise.all` me chalayein with 4–5s timeout per article (ki function slow na ho).
- **Step D — Topic-specific Unsplash source URL** as fallback (e.g. `https://source.unsplash.com/featured/800x500/?cricket,sports` topic + first 2 keywords from title se).
- **Step E — SVG placeholder** as last resort (already implemented).

In-memory cache (Map) URL→image rakhein taaki repeat calls fast ho.

### 2. Frontend (`src/components/NewsFeed.tsx`)
- `onError` fallback chain: image fail → topic+title-based Unsplash URL try → fir SVG.
- `loading="lazy"` already implicit; add `referrerPolicy="no-referrer"` taaki publisher images load ho sakein bina hotlink block ke.

### 3. Deploy & verify
- Edge function deploy karein.
- `curl_edge_functions` se test karke confirm karein ki articles me ab real `image` URLs aa rahe hain (not data:image/svg).

## Out of scope
- News content / language / animations — sirf images fix.
- Image proxying / caching server-side beyond in-memory per-invocation cache.

## Risks
- OG scraping har article ke liye extra fetch = function slower (~2–4s extra). Mitigation: parallel fetches + timeout + cache.
- Kuch publishers hotlink block karte hain → frontend fallback chain handle karega.
