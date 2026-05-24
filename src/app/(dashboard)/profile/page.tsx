"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setAvatarUrl(session.user.image ?? "");
    }
  }, [session]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");
      setAvatarUrl(json.data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar: avatarUrl }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update profile");
      toast.success("Profile updated successfully");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <DashboardShell title="Profile">
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading profile...</div>
      </DashboardShell>
    );
  }

  if (!session?.user) {
    return (
      <DashboardShell title="Profile">
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">No profile available.</div>
      </DashboardShell>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <DashboardShell title="Profile">
      <div className="space-y-6 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-sky-100 text-3xl font-semibold text-sky-700 dark:bg-sky-900 dark:text-sky-100">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    {initials}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Profile</p>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {session.user.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900"
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  {session.user.email}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="avatar">Profile image</Label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-slate-600 file:rounded-md file:border file:border-slate-300 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:text-slate-900 hover:file:bg-slate-200 dark:text-slate-300 dark:file:border-slate-700 dark:file:bg-slate-900 dark:file:text-slate-100 dark:hover:file:bg-slate-800"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload a profile picture and update your display name.
              </p>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Account details
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Role</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {session.user.role ?? "User"}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Last signed in</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {new Date(session.expires).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
