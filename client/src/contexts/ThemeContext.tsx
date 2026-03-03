import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "staff-sync-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
    children,
    defaultTheme = "light",
}: {
    children: ReactNode;
    defaultTheme?: Theme;
}) {
    const [theme, setThemeState] = useState<Theme>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "light" || stored === "dark") return stored;
        } catch {
            // ignore
        }
        return defaultTheme;
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);

    function setTheme(t: Theme) {
        setThemeState(t);
        try {
            localStorage.setItem(STORAGE_KEY, t);
        } catch {
            // ignore
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
}
