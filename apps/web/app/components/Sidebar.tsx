"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Play,
    Network,
    BookOpen,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
    {
        title: "VirtualNet",
        href: "/virtualnet",
        icon: Network,
        description: "Fork & test on virtual network",
    },
    {
        title: "Simulator",
        href: "/simulator",
        icon: Play,
        description: "Simulate transactions",
    },
];

const externalLinks = [
    {
        title: "Documentation",
        href: "https://docs.tracce.lol",
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    // Check if the current path matches or is a child of the nav item
    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname === href || pathname.startsWith(`${href}/`);
    };


    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
                <Link href="/simulator" className="flex items-center gap-2 group">
                    <img
                        src="/logo.png"
                        alt="Trace Logo"
                        className="w-20 h-auto object-contain dark:invert-0 invert transition-transform group-hover:scale-105"
                    />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                "hover:bg-accent hover:text-accent-foreground",
                                active && [
                                    "bg-primary/10 text-primary",
                                    "dark:bg-primary/20 dark:text-primary",
                                    "border-l-2 border-primary -ml-0.5 pl-[calc(0.75rem+2px)]",
                                ]
                            )}
                        >
                            <item.icon className={cn(
                                "h-4 w-4 shrink-0",
                                active && "text-primary"
                            )} />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}

                <Separator className="my-4" />

                {externalLinks.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                            "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.title}</span>
                        <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t space-y-3">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">Theme</span>
                    <ThemeToggle />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Movement L1 DevTools
                </p>
            </div>
        </div>
    );
}
