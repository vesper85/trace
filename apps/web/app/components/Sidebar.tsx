"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Play,
    FileCode,
    Settings,
    BookOpen,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
    {
        title: "Simulator",
        href: "/simulator",
        icon: Play,
    },
    {
        title: "Contracts",
        href: "/contracts",
        icon: FileCode,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

const externalLinks = [
    {
        title: "Documentation",
        href: "https://docs.movementnetwork.xyz",
        icon: BookOpen,
    },
    {
        title: "Explorer",
        href: "https://explorer.movementnetwork.xyz",
        icon: ExternalLink,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
                <Link href="/simulator" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="font-bold">M</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold">Movement</span>
                        <span className="text-xs text-muted-foreground">Developer Tools</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-3 space-y-1">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Navigation
                </p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3",
                                    isActive && "bg-secondary"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Button>
                        </Link>
                    );
                })}

                <Separator className="my-4" />

                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Resources
                </p>
                {externalLinks.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <item.icon className="h-4 w-4" />
                            {item.title}
                            <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                        </Button>
                    </a>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                    Movement L1 DevTools
                </p>
            </div>
        </div>
    );
}
