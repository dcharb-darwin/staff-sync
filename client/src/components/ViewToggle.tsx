import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ViewToggle — shared card/list toggle component (D2 compliance).
 * Persists preference in localStorage per page key.
 *
 * Usage: Parent owns state via useViewMode(), passes mode + onModeChange to ViewToggle.
 */

export type ViewMode = "card" | "list";

export function useViewMode(pageKey: string, defaultMode: ViewMode = "list"): [ViewMode, (mode: ViewMode) => void] {
    const storageKey = `staffsync-view-${pageKey}`;
    const [mode, setModeState] = useState<ViewMode>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored === "card" || stored === "list") return stored;
        } catch {
            // ignore
        }
        return defaultMode;
    });

    const setMode = (newMode: ViewMode) => {
        setModeState(newMode);
        try {
            localStorage.setItem(storageKey, newMode);
        } catch {
            // ignore
        }
    };

    return [mode, setMode];
}

interface ViewToggleProps {
    /** Current view mode — parent drives this via useViewMode() */
    mode: ViewMode;
    /** Callback when user clicks a toggle button */
    onModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onModeChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-0.5 rounded-lg border bg-white p-0.5">
            <button
                onClick={() => onModeChange("list")}
                className={cn(
                    "rounded-md p-1.5 transition-colors",
                    mode === "list"
                        ? "bg-blue-50 text-blue-700"
                        : "text-muted-foreground hover:bg-slate-50"
                )}
                title="List view"
            >
                <List className="h-4 w-4" />
            </button>
            <button
                onClick={() => onModeChange("card")}
                className={cn(
                    "rounded-md p-1.5 transition-colors",
                    mode === "card"
                        ? "bg-blue-50 text-blue-700"
                        : "text-muted-foreground hover:bg-slate-50"
                )}
                title="Card view"
            >
                <LayoutGrid className="h-4 w-4" />
            </button>
        </div>
    );
}
