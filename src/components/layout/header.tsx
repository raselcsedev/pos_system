"use client";

import { signOut, useSession } from "next-auth/react";
import { Moon, Sun, LogOut, Menu } from "lucide-react";
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
      <div className="flex items-center gap-3">
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
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 hover:text-sky-600 dark:text-slate-200 dark:hover:text-sky-300"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
