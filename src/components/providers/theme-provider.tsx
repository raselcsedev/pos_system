"use client";

import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type Theme = "light" | "dark" | "system";
type ThemeValue = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: "class" | string;
  storageKey?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  value?: Record<ThemeValue, string>;
};

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ThemeValue;
  setTheme: (theme: Theme | ((prevTheme: Theme) => Theme)) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getPreferredTheme(): ThemeValue {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(
  theme: Theme,
  attribute: string,
  value: Record<ThemeValue, string> | undefined,
  enableSystem: boolean,
  enableColorScheme: boolean
): ThemeValue {
  const root = document.documentElement;
  const resolvedTheme: ThemeValue =
    theme === "system"
      ? enableSystem
        ? getPreferredTheme()
        : "light"
      : theme;
  const themeValue = (value?.[resolvedTheme] ?? resolvedTheme) as string;

  if (attribute === "class") {
    root.classList.remove("light", "dark");
    if (themeValue) {
      root.classList.add(themeValue);
    }
  } else {
    root.setAttribute(attribute, themeValue);
  }

  if (enableColorScheme) {
    root.style.colorScheme = resolvedTheme;
  }

  return resolvedTheme;
}

function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  try {
    const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;
    return storedTheme || defaultTheme;
  } catch {
    return defaultTheme;
  }
}

export function ThemeProvider({
  children,
  attribute = "class",
  storageKey = "theme",
  defaultTheme = "system",
  enableSystem = true,
  enableColorScheme = true,
  value,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<ThemeValue>(
    defaultTheme === "dark"
      ? "dark"
      : defaultTheme === "light"
      ? "light"
      : "light"
  );

  useIsomorphicLayoutEffect(() => {
    const initialTheme = getInitialTheme(storageKey, defaultTheme);
    const resolved = applyTheme(
      initialTheme,
      attribute,
      value,
      enableSystem,
      enableColorScheme
    );

    setTheme(initialTheme);
    setResolvedTheme(resolved);
  }, [attribute, defaultTheme, enableColorScheme, enableSystem, storageKey, value]);

  useIsomorphicLayoutEffect(() => {
    if (theme !== "system" || !enableSystem) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      const nextResolved = event.matches ? "dark" : "light";
      applyTheme(theme, attribute, value, enableSystem, enableColorScheme);
      setResolvedTheme(nextResolved);
    };

    mediaQuery.addEventListener
      ? mediaQuery.addEventListener("change", handleChange)
      : mediaQuery.addListener(handleChange);

    return () => {
      mediaQuery.removeEventListener
        ? mediaQuery.removeEventListener("change", handleChange)
        : mediaQuery.removeListener(handleChange);
    };
  }, [attribute, enableColorScheme, enableSystem, theme, value]);

  const setThemeState = React.useCallback(
    (nextTheme: Theme | ((prevTheme: Theme) => Theme)) => {
      setTheme((currentTheme) => {
        const next =
          typeof nextTheme === "function" ? nextTheme(currentTheme) : nextTheme;
        const resolved = applyTheme(
          next,
          attribute,
          value,
          enableSystem,
          enableColorScheme
        );

        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          // Ignore storage failures.
        }

        setResolvedTheme(resolved);
        return next;
      });
    },
    [attribute, enableColorScheme, enableSystem, storageKey, value]
  );

  const contextValue = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme: setThemeState }),
    [theme, resolvedTheme, setThemeState]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
