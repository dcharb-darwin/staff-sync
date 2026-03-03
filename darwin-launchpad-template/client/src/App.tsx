import { useState } from "react";

type ViewMode = "mvp" | "vision";

export default function App() {
    const [viewMode, setViewMode] = useState<ViewMode>("mvp");

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <h1 className="text-xl font-semibold text-slate-900">
                        {/* TODO: Replace with project name */}
                        Darwin Project
                    </h1>
                    <nav className="flex items-center gap-6">
                        {/* TODO: Add navigation links */}
                        <a href="/" className="text-sm font-medium text-blue-600">
                            Dashboard
                        </a>
                        <a href="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            Admin
                        </a>
                        <button
                            onClick={() => setViewMode(viewMode === "mvp" ? "vision" : "mvp")}
                            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                            {viewMode === "mvp" ? "MVP" : "Vision"}
                        </button>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Welcome to your Darwin project
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        This is the starter template. Replace this content with your
                        application pages. Current mode:{" "}
                        <span className="font-medium text-blue-600">{viewMode.toUpperCase()}</span>
                    </p>
                </div>
            </main>
        </div>
    );
}
