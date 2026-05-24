"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Moon, Sun, LogOut, Menu, User } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleThemeToggle = () => {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between bg-sky-50 px-4 text-slate-900 shadow-sm shadow-sky-200/50 dark:bg-sky-950 dark:text-slate-100 dark:shadow-sky-950/40 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        <Badge variant="secondary" className="capitalize bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100">
          {session?.user?.role ?? "guest"}
        </Badge>
        <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
          {session?.user?.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:text-sky-600 dark:text-slate-200 dark:hover:text-sky-300"
          onClick={handleThemeToggle}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <button
          type="button"
          onClick={() => setDropdownOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          aria-label="Open profile menu"
        >
          {session?.user?.name ? initials : <User className="h-5 w-5" />}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="space-y-1 p-4 text-sm text-slate-700 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {session?.user?.name ?? "Profile"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {session?.user?.email ?? "No email"}
              </p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
