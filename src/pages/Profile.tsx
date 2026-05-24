import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { profile as profileApi, games, bookmarks as bkApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  User, Mail, MapPin, Briefcase, Calendar, Edit3, Save, X,
  Flame, Trophy, Star, BookOpen, Gamepad2, Bookmark,
  Globe2, Cpu, Newspaper, HeartPulse, FlaskConical, Film, Crown,
  Camera, CheckCircle2, LogOut,
} from "lucide-react";

const INTERESTS = [
  { id: "World",         icon: Globe2 },
  { id: "Tech",          icon: Cpu },
  { id: "Business",      icon: Briefcase },
  { id: "Science",       icon: FlaskConical },
  { id: "Sports",        icon: Trophy },
  { id: "Health",        icon: HeartPulse },
  { id: "Entertainment", icon: Film },
  { id: "Politics",      icon: Newspaper },
];

interface ProfileData {
  full_name: string; age: string; occupation: string;
  country: string; bio: string; avatar_url: string; interests: string[];
}

interface Stats {
  streak: number; total_score: number; games_played: number; bookmarks_count: number;
}

const AVATAR_COLORS = [
  "from-orange-400 to-rose-500",
  "from-violet-500 to-purple-600",
  "from-teal-400 to-cyan-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-blue-400 to-indigo-500",
];

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing]     = useState(false);
  const [busy, setBusy]           = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats]         = useState<Stats>({ streak: 0, total_score: 0, games_played: 0, bookmarks_count: 0 });
  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview"|"bookmarks"|"scores">("overview");
  const colorIdx = useRef(Math.floor(Math.random() * AVATAR_COLORS.length));

  const [form, setForm] = useState<ProfileData>({
    full_name: "", age: "", occupation: "", country: "", bio: "", avatar_url: "", interests: [],
  });
  const [saved, setSaved] = useState<ProfileData>({ ...form });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading]);

  // Load profile + stats
  useEffect(() => {
    if (!user) return;
    setLoadingData(true);

    Promise.allSettled([
      profileApi.get(),
      games.streak(),
      games.myScores(10),
      bkApi.list(),
    ]).then(([profRes, streakRes, scoresRes, bkRes]) => {
      if (profRes.status === "fulfilled" && profRes.value.profile) {
        const p = profRes.value.profile;
        const d: ProfileData = {
          full_name:   p.full_name  || user.full_name || "",
          age:         p.age?.toString() || "",
          occupation:  p.occupation || "",
          country:     p.country    || "",
          bio:         p.bio        || "",
          avatar_url:  p.avatar_url || user.avatar_url || "",
          interests:   p.interests  || [],
        };
        setForm(d); setSaved(d);
      } else {
        // Seed from auth user
        const d: ProfileData = { full_name: user.full_name || "", age: "", occupation: "", country: "", bio: "", avatar_url: user.avatar_url || "", interests: [] };
        setForm(d); setSaved(d);
      }

      const streak = streakRes.status === "fulfilled" ? streakRes.value.streak : 0;
      const scores = scoresRes.status === "fulfilled" ? scoresRes.value.scores || [] : [];
      const bks    = bkRes.status    === "fulfilled" ? bkRes.value.bookmarks || [] : [];

      const totalScore  = scores.reduce((s: number, x: any) => s + (x.score || 0), 0);
      setStats({ streak, total_score: totalScore, games_played: scores.length, bookmarks_count: bks.length });
      setRecentScores(scores.slice(0, 8));
      setSavedArticles(bks.slice(0, 12));
    }).finally(() => setLoadingData(false));
  }, [user]);

  const toggleInterest = (id: string) =>
    setForm(f => ({
      ...f, interests: f.interests.includes(id) ? f.interests.filter(x => x !== id) : [...f.interests, id],
    }));

  const saveProfile = async () => {
    setBusy(true);
    try {
      await profileApi.upsert({
        full_name:  form.full_name  || undefined,
        age:        form.age ? parseInt(form.age) : undefined,
        occupation: form.occupation || undefined,
        country:    form.country    || undefined,
        bio:        form.bio        || undefined,
        avatar_url: form.avatar_url || undefined,
        interests:  form.interests,
      });
      setSaved({ ...form });
      setEditing(false);
      toast.success("Profile saved!");
    } catch (e: any) {
      toast.error(e.message || "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const cancelEdit = () => { setForm({ ...saved }); setEditing(false); };

  const removeBookmark = async (id: string, url: string) => {
    try {
      await bkApi.remove(id);
      setSavedArticles(a => a.filter(x => x.id !== id));
      setStats(s => ({ ...s, bookmarks_count: s.bookmarks_count - 1 }));
      toast.success("Removed");
    } catch { toast.error("Could not remove"); }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse mx-auto" />
            <p className="text-muted-foreground">Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = (form.full_name || user.full_name || user.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-br from-primary/20 via-background to-accent/10 border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--primary)/0.3) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(var(--accent)/0.25) 0%, transparent 50%)" }} />
        <div className="container relative py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt={form.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-xl" />
              ) : (
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIdx.current]}
                  flex items-center justify-center text-white font-serif font-bold text-3xl
                  border-4 border-background shadow-xl`}>
                  {initials}
                </div>
              )}
              {editing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                  title="Change avatar URL">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-serif font-bold text-3xl">
                {form.full_name || user.full_name || "EchoBrief User"}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                {form.occupation && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{form.occupation}</span>}
                {form.country && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{form.country}</span>}
              </div>
              {form.bio && <p className="mt-2 text-sm text-muted-foreground max-w-xl">{form.bio}</p>}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!editing ? (
                <Button onClick={() => setEditing(true)} variant="outline" className="gap-1.5">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={saveProfile} disabled={busy} className="gap-1.5 btn-glow">
                    <Save className="w-4 h-4" /> {busy ? "Saving…" : "Save"}
                  </Button>
                  <Button onClick={cancelEdit} variant="outline" className="gap-1.5">
                    <X className="w-4 h-4" /> Cancel
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate("/"))}
                className="gap-1.5 text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: Flame,     label: "Day Streak",    value: stats.streak,         color: "text-orange-500", bg: "bg-orange-500/10" },
              { icon: Star,      label: "Total Score",   value: stats.total_score,    color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { icon: Gamepad2,  label: "Games Played",  value: stats.games_played,   color: "text-primary",    bg: "bg-primary/10" },
              { icon: Bookmark,  label: "Bookmarks",     value: stats.bookmarks_count, color: "text-accent",    bg: "bg-accent/10" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center border border-border/50`}>
                <s.icon className={`w-6 h-6 mx-auto ${s.color} mb-1`} />
                <p className="font-serif font-bold text-2xl">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-border bg-card sticky top-[57px] z-30">
        <div className="container flex gap-0">
          {(["overview","bookmarks","scores"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all capitalize ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {tab === "overview" ? "Overview" : tab === "bookmarks" ? `Bookmarks (${savedArticles.length})` : `Game History (${recentScores.length})`}
            </button>
          ))}
        </div>
      </div>

      <main className="container py-8">

        {/* ── Overview tab ── */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left: editable details */}
            <div className="lg:col-span-2 space-y-5">

              {/* Personal info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Personal Info
                </h3>
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input type="number" min="1" max="120" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="25" />
                      </div>
                      <div>
                        <Label>Occupation</Label>
                        <Input value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} placeholder="Software Engineer" />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="India" />
                      </div>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                        placeholder="Tell us about yourself…" rows={3} />
                    </div>
                    <div>
                      <Label>Avatar URL <span className="text-muted-foreground text-xs">(paste an image link)</span></Label>
                      <Input value={form.avatar_url} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} placeholder="https://…" />
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {[
                      { label: "Full Name",   value: form.full_name,  icon: User },
                      { label: "Age",         value: form.age ? `${form.age} years` : null, icon: Calendar },
                      { label: "Occupation",  value: form.occupation, icon: Briefcase },
                      { label: "Country",     value: form.country,    icon: MapPin },
                    ].map(row => (
                      <div key={row.label} className="flex items-start gap-2">
                        <row.icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">{row.label}</p>
                          <p className="font-medium">{row.value || <span className="text-muted-foreground italic">Not set</span>}</p>
                        </div>
                      </div>
                    ))}
                    {form.bio && (
                      <div className="sm:col-span-2 flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Bio</p>
                          <p className="font-medium">{form.bio}</p>
                        </div>
                      </div>
                    )}
                    {!form.full_name && !form.occupation && !form.country && (
                      <div className="sm:col-span-2 text-center py-4">
                        <p className="text-muted-foreground text-sm">No details yet.</p>
                        <Button size="sm" variant="outline" className="mt-2" onClick={() => setEditing(true)}>
                          <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Add details
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Interests */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" /> News Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(({ id, icon: Icon }) => {
                    const active = form.interests.includes(id);
                    return (
                      <button key={id} onClick={() => editing && toggleInterest(id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          active
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : editing
                              ? "bg-card border-border hover:border-primary cursor-pointer"
                              : "bg-card border-border opacity-60 cursor-default"
                        }`}>
                        <Icon className="w-3.5 h-3.5" /> {id}
                        {active && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
                {editing && (
                  <p className="text-xs text-muted-foreground mt-2">Click topics to toggle your interests</p>
                )}
                {!editing && form.interests.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <button onClick={() => setEditing(true)} className="text-primary hover:underline">
                      Select your interests
                    </button> to get personalised news
                  </p>
                )}
              </div>
            </div>

            {/* Right: quick links + leaderboard rank */}
            <div className="space-y-5">
              {/* Quick actions */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: "Read Today's News",  to: "/news",   icon: Newspaper, color: "text-primary" },
                    { label: "Play Daily Games",   to: "/games",  icon: Gamepad2,  color: "text-accent" },
                    { label: "View Leaderboard",   to: "/games",  icon: Trophy,    color: "text-yellow-500" },
                    { label: "Upgrade to Pro",     to: "/#upgrade", icon: Crown,   color: "text-amber-500" },
                  ].map(item => (
                    <Link key={item.label} to={item.to}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-sm font-medium">
                      <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Streak card */}
              <div className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 border border-orange-500/20 rounded-xl p-5 text-center">
                <Flame className="w-10 h-10 mx-auto text-orange-500 mb-2" />
                <p className="font-serif font-bold text-4xl">{stats.streak}</p>
                <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
                {stats.streak === 0 && (
                  <Link to="/games">
                    <Button size="sm" className="mt-3 gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5" /> Start Today
                    </Button>
                  </Link>
                )}
                {stats.streak > 0 && (
                  <p className="text-xs text-orange-500 mt-2 font-semibold">🔥 Keep it going!</p>
                )}
              </div>

              {/* Account info */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Account</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-semibold text-primary">Free</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium truncate max-w-[140px]">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-medium capitalize">Email</span>
                  </div>
                </div>
                <Button variant="destructive" size="sm" className="w-full mt-4 gap-1.5"
                  onClick={() => signOut().then(() => navigate("/"))}>
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Bookmarks tab ── */}
        {activeTab === "bookmarks" && (
          <div>
            {savedArticles.length === 0 ? (
              <div className="text-center py-20">
                <Bookmark className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-lg text-muted-foreground">No saved articles yet</p>
                <Link to="/news">
                  <Button className="mt-4 gap-1.5"><Newspaper className="w-4 h-4" /> Browse News</Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedArticles.map((bk: any) => (
                  <div key={bk.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    {bk.image && (
                      <a href={bk.article_url} target="_blank" rel="noopener noreferrer">
                        <img src={bk.image} alt={bk.title}
                          className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105" />
                      </a>
                    )}
                    <div className="p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">{bk.source || bk.topic || "News"}</p>
                      <a href={bk.article_url} target="_blank" rel="noopener noreferrer">
                        <h4 className="font-serif font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{bk.title}</h4>
                      </a>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{bk.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(bk.saved_at).toLocaleDateString()}
                        </span>
                        <button onClick={() => removeBookmark(bk.id, bk.article_url)}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Game History tab ── */}
        {activeTab === "scores" && (
          <div>
            {recentScores.length === 0 ? (
              <div className="text-center py-20">
                <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-lg text-muted-foreground">No games played yet</p>
                <Link to="/games">
                  <Button className="mt-4 gap-1.5"><Gamepad2 className="w-4 h-4" /> Play Now</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-w-2xl">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Total Score",  value: stats.total_score, icon: Star,    color: "text-yellow-500" },
                    { label: "Games Played", value: stats.games_played, icon: Gamepad2, color: "text-primary" },
                    { label: "Best Streak",  value: stats.streak,      icon: Flame,   color: "text-orange-500" },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                      <s.icon className={`w-6 h-6 mx-auto ${s.color} mb-1`} />
                      <p className="font-bold text-2xl">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                {recentScores.map((sc: any) => (
                  <div key={sc.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {sc.game === "sudoku"     && <span className="text-lg">🧩</span>}
                      {sc.game === "wordsearch" && <span className="text-lg">🔤</span>}
                      {sc.game === "crossword"  && <span className="text-lg">📝</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold capitalize">{sc.game}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sc.played_at).toLocaleDateString()} · {sc.duration_seconds ? `${sc.duration_seconds}s` : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">+{sc.score}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
