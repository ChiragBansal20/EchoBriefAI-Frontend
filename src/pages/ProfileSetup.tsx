import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profile as profileApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const INTERESTS = ["World","Tech","Business","Science","Sports","Health","Entertainment","Politics"];

const ProfileSetup = () => {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "", age: "", occupation: "", country: "", bio: "",
    interests: [] as string[],
  });

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    profileApi.get()
      .then(({ profile: p }) => {
        if (p) setForm({
          full_name: p.full_name ?? "",
          age: p.age?.toString() ?? "",
          occupation: p.occupation ?? "",
          country: p.country ?? "",
          bio: p.bio ?? "",
          interests: p.interests ?? [],
        });
      })
      .catch(() => {});
  }, [user]);

  const toggle = (i: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await profileApi.upsert({
        full_name: form.full_name || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        occupation: form.occupation || undefined,
        country: form.country || undefined,
        bio: form.bio || undefined,
        interests: form.interests,
      });
      toast.success("Profile saved!");
      nav("/", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Complete your profile</CardTitle>
          <CardDescription>Tell us about yourself for a personalised experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Age</Label><Input type="number" min="1" max="120" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} /></div>
              <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} /></div>
            </div>
            <div><Label>Occupation</Label><Input value={form.occupation} onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))} /></div>
            <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} /></div>
            <div>
              <Label className="block mb-2">Interests</Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <button type="button" key={i} onClick={() => toggle(i)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      form.interests.includes(i) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                    }`}>{i}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={busy}>Save profile</Button>
              <Button type="button" variant="ghost" onClick={() => nav("/")}>Skip for now</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
