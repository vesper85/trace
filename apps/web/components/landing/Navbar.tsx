"use client";

import React from "react";
import { MenuItem, ProductItem } from "./ui/NavbarMenu";
import { ThemeSwitcher } from "./ThemeToggle";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { StickyBanner } from "./StickyBanner";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GradientButton } from "./ui/GradientButton";

export function Navbar() {
  const [active, setActive] = React.useState<string | null>(null);
  const [bannerOpen, setBannerOpen] = React.useState(true);
  const [bannerVisible, setBannerVisible] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 19,
    minutes: 39,
    seconds: 0
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const { days, hours, minutes, seconds } = prevTime;

        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(timer);
          return prevTime;
        }

        if (seconds > 0) {
          return { ...prevTime, seconds: seconds - 1 };
        } else if (minutes > 0) {
          return { ...prevTime, minutes: minutes - 1, seconds: 59 };
        } else if (hours > 0) {
          return { ...prevTime, hours: hours - 1, minutes: 59, seconds: 59 };
        } else if (days > 0) {
          return { ...prevTime, days: days - 1, hours: 23, minutes: 59, seconds: 59 };
        }

        return prevTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* <StickyBanner
        isVisible={bannerOpen}
        onClose={() => setBannerOpen(false)}
        onVisibilityChange={setBannerVisible}
        className="bg-gradient-to-b from-orange-500 to-orange-600"
      >
        <div className="flex items-center justify-center gap-2 md:gap-4 text-white text-xs md:text-sm">
          <span className="font-medium">🚀 Beta on Movement Labs</span>
          <span className="hidden md:inline text-xs md:text-sm">
            Trace is now available for testing on Movement L1
          </span>
          <Button size={"sm"} className="text-xs">Try Now</Button>
        </div>
      </StickyBanner> */}
      <nav
        className={cn(
          "py-2 flex items-center justify-between max-w-6xl mx-auto px-3 md:px-5 rounded-xl md:rounded-2xl backdrop-blur-md dark:bg-black/40 bg-white/40 border shadow-lg transition-all duration-300",
          bannerVisible ? "mt-2 md:mt-4" : "mt-2 md:mt-4"
        )}
        style={{
          transform: bannerVisible ? "translateY(0)" : "translateY(-48px)",
          transition: "transform 0.3s ease-in-out",
        }}
        onMouseLeave={() => setActive(null)}
      >
        <div className="flex items-center gap-2 py-2 md:py-4 px-1 md:px-2 rounded-md">
          <img src="/logo.png" alt="TUF Logo" className="w-10 md:w-14 object-contain dark:invert-0 invert-[1]" />
        </div>

        {/* Desktop Navigation Items */}
        <div className="hidden lg:flex items-center gap-6">
          {/* <Link
            href="#features"
            className="text-muted-foreground dark:text-neutral-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Features
          </Link>

          <Link
            href="#why"
            className="text-muted-foreground dark:text-neutral-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Why Trace
          </Link> */}

          <ThemeSwitcher />

          {/* <div className="flex items-center gap-2">
            <a
              href="https://trace-docs-eight.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GradientButton variant="orange" text="Docs" size="sm" />
            </a>
          </div> */}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeSwitcher />
          <a
            href="https://trace-docs-eight.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="orange" size="sm" className="text-xs px-2">
              Docs
            </Button>
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed right-0 top-0 h-full w-64 bg-background border-l shadow-lg p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-secondary rounded-md transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <Link href="#features" className="block py-2 font-medium hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>

                <Link href="#why" className="block py-2 font-medium hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Why Trace
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
