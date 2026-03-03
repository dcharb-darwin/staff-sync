// Shared types and constants between client and server
// Keep this file framework-agnostic (no React, no Express imports)

// TODO: Replace with domain-specific types

export type UserRole = "admin" | "viewer";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    admin: "Administrator",
    viewer: "Viewer",
};

// View mode for MVP/Vision toggle
export type ViewMode = "mvp" | "vision";
