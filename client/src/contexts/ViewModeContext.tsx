import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type ViewMode = "mvp" | "vision";

interface ViewModeContextValue {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    isMvp: boolean;
}

const STORAGE_KEY = "staff-sync-view-mode";

const ViewModeContext = createContext<ViewModeContextValue | undefined>(undefined);

function getStoredMode(): ViewMode {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "mvp" || stored === "vision") return stored;
    } catch {
        // ignore
    }
    return "mvp";
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
    const [viewMode, setViewModeState] = useState<ViewMode>(getStoredMode);

    const setViewMode = useCallback((mode: ViewMode) => {
        setViewModeState(mode);
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            // ignore
        }
    }, []);

    // Cross-tab sync via StorageEvent
    useEffect(() => {
        function handleStorage(e: StorageEvent) {
            if (e.key === STORAGE_KEY && (e.newValue === "mvp" || e.newValue === "vision")) {
                setViewModeState(e.newValue);
            }
        }
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    return (
        <ViewModeContext.Provider value={{ viewMode, setViewMode, isMvp: viewMode === "mvp" }}>
            {children}
        </ViewModeContext.Provider>
    );
}

export function useViewMode(): ViewModeContextValue {
    const ctx = useContext(ViewModeContext);
    if (!ctx) throw new Error("useViewMode must be used within a ViewModeProvider");
    return ctx;
}
