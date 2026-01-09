"use client";

import * as React from "react";
import { Button } from "@/components/landing/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/landing/ui/tooltip";
import {
  Facebook,
  Instagram,
  Linkedin,
  Moon,
  Send,
  Sun,
  Twitter,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeToggle";

export function Footer() {
  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="inline-block dark:bg-transparent bg-black py-4 px-2 rounded-md">
              <img
                src="/logo.png"
                alt="Trace Logo"
                className="w-14 object-contain"
              />
            </div>
            <p className="text-muted-foreground text-center md:text-left max-w-md">
              A powerful suite of debugging and development tools for the
              Movement L1 blockchain.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Follow us on Twitter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <a
              href="https://trace-docs-eight.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              View Docs
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            Copyright © 2025 Movement Labs | Trace Beta
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}
