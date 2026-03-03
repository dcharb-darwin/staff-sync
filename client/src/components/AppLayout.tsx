import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Processes", href: "/processes" },
    { label: "Readiness", href: "/readiness" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
    const [location] = useLocation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <Shield className="h-4 w-4" />
                        </div>
                        <span className="text-foreground">Staff Sync</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === "/"
                                    ? location === "/"
                                    : location.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-8">{children}</main>
        </div>
    );
}
