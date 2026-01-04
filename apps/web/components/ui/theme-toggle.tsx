"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={cn("flex items-center gap-1 p-1 rounded-lg bg-muted", className)}>
                <div className="h-8 w-8 rounded-md animate-pulse bg-muted-foreground/20" />
                <div className="h-8 w-8 rounded-md animate-pulse bg-muted-foreground/20" />
                <div className="h-8 w-8 rounded-md animate-pulse bg-muted-foreground/20" />
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-1 p-1 rounded-lg bg-muted", className)}>
            {themes.map(({ value, label, icon: Icon }) => (
                <Button
                    key={value}
                    variant={theme === value ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTheme(value)}
                    className={cn(
                        "h-8 w-8 p-0 transition-all duration-200",
                        theme === value && "bg-background shadow-sm ring-1 ring-border"
                    )}
                    title={label}
                >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                </Button>
            ))}
        </div>
    );
}

export function ThemeToggleDropdown({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className={cn("gap-2", className)} disabled>
                <div className="h-4 w-4 animate-pulse bg-muted-foreground/20 rounded" />
                <span>Theme</span>
            </Button>
        );
    }

    const currentTheme = themes.find((t) => t.value === theme) || themes[0];
    const CurrentIcon = currentTheme!.icon;

    const cycleTheme = () => {
        const currentIndex = themes.findIndex((t) => t.value === theme);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]!.value);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            className={cn("gap-2 w-full justify-start", className)}
            title={`Current: ${currentTheme.label}. Click to change.`}
        >
            <CurrentIcon className="h-4 w-4" />
            <span>{currentTheme.label}</span>
            <Palette className="h-3 w-3 ml-auto opacity-50" />
        </Button>
    );
}
