"use client";

import { IconAi, IconCheck, IconSettingsBolt } from "@tabler/icons-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GradientButton } from "./ui/GradientButton";

interface ComparisonFeature {
  id: string;
  name: string;
  tufFree: string;
  tufPremium: string;
  otherPlatforms: string;
}

interface DetailedFeature {
  id: string;
  name: string;
  tufDescription: string;
  otherPlatformsDescription: string;
}

const detailedFeatures: DetailedFeature[] = [
  {
    id: "simulation",
    name: "Transaction Simulation",
    tufDescription:
      "Preview any entry or view function before executing. See exact gas costs, events, and state changes in advance.",
    otherPlatformsDescription:
      "Deploy to testnet and hope for the best. Debugging requires multiple deployments and transactions.",
  },
  {
    id: "network-forking",
    name: "Network Forking",
    tufDescription:
      "Fork mainnet or testnet at any point. Test against real state without risking real assets.",
    otherPlatformsDescription:
      "Limited to testnet only. Cannot test against production state or data.",
  },
  {
    id: "error-messages",
    name: "Error Messages",
    tufDescription:
      "Human-readable error messages with abort codes, exact error locations, and suggested fixes.",
    otherPlatformsDescription:
      "Cryptic error codes that require manual lookup and interpretation.",
  },
  {
    id: "gas-analysis",
    name: "Gas Analysis",
    tufDescription:
      "Detailed breakdown of gas costs by operation. Optimize before deployment.",
    otherPlatformsDescription:
      "Only see gas costs after transaction execution. No breakdown or optimization hints.",
  },
  {
    id: "state-inspection",
    name: "State Inspection",
    tufDescription:
      "View all resource changes, emitted events, and return values in a clean UI.",
    otherPlatformsDescription:
      "Parse raw transaction receipts manually. Limited visibility into state changes.",
  },
  {
    id: "movement-native",
    name: "Movement Native",
    tufDescription:
      "Built specifically for Movement L1. Full support for Move modules and Movement-specific features.",
    otherPlatformsDescription:
      "Generic blockchain tools not optimized for Movement ecosystem.",
  },
];

const comparisonFeatures: ComparisonFeature[] = [
  {
    id: "tx-simulation",
    name: "Transaction Simulation",
    tufFree: "✓",
    tufPremium: "Full entry and view function support",
    otherPlatforms: "—",
  },
  {
    id: "network-fork",
    name: "Network Forking",
    tufFree: "✓",
    tufPremium: "Fork from mainnet or testnet",
    otherPlatforms: "—",
  },
  {
    id: "contract-loader",
    name: "Contract Loader",
    tufFree: "✓",
    tufPremium: "Auto-discover modules and functions",
    otherPlatforms: "✓",
  },
  {
    id: "gas-breakdown",
    name: "Detailed Gas Breakdown",
    tufFree: "✓",
    tufPremium: "Per-operation cost analysis",
    otherPlatforms: "—",
  },
  {
    id: "state-changes",
    name: "State Change Viewer",
    tufFree: "✓",
    tufPremium: "Before/after resource comparison",
    otherPlatforms: "—",
  },
  {
    id: "session-history",
    name: "Session History",
    tufFree: "✓",
    tufPremium: "Complete transaction replay",
    otherPlatforms: "—",
  },
];

export function CompareSection() {
  const [compareType, setCompareType] = useState<
    "TUF_FREE" | "OTHER_PLATFORMS"
  >("TUF_FREE");

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h2 className="md:text-3xl md:text-left text-xl text-center mb-10">
            Why Choose <span className="text-orange-500">Trace</span>
          </h2>

          <div className="inline-block">
            <CompareTypeSwitch
              compareType={compareType}
              setCompareType={setCompareType}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-secondary/30 border rounded-2xl overflow-hidden"
        >
          {compareType === "TUF_FREE" ? (
            // Detailed Comparison View
            <div>
              <div className="grid grid-cols-3 gap-4 p-6 bg-secondary border-b">
                <div className="font-semibold">Features</div>
                <div className="text-">
                  <div className="text-2xl font-semibold">Traditional</div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <img
                    src="/logo.png"
                    alt="Trace Logo"
                    className="w-10 h-10 object-contain dark:invert-0 invert-[1]"
                  />
                </div>
              </div>
              <div className="divide-y">
                {detailedFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="grid grid-cols-3 gap-4 p-6 hover:bg-neutral-750 transition-colors"
                  >
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {feature.otherPlatformsDescription}
                    </div>
                    <div className="text-sm leading-relaxed">
                      {feature.tufDescription}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-4 p-6 bg-secondary border-b">
                <div className="font-semibold text-lg">Features</div>
                <div className="text-center">
                  <div className="text-lg font-semibold">Traditional</div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <img
                    src="/logo.png"
                    alt="Trace Logo"
                    className="w-10 h-10 object-contain dark:invert-0 invert-[1]"
                  />
                </div>
              </div>

              <div className="divide-y">
                {comparisonFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="grid grid-cols-3 gap-4 p-6 hover:bg-neutral-800/20 transition-colors"
                  >
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-center">
                      {feature.otherPlatforms === "✓" ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500">
                          <span className="text-sm text-white font-bold">
                            <IconCheck className="h-3 w-3" />
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xl font-bold">
                          —
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {feature.tufFree === "✓" ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            <IconCheck className="h-3 w-3" />
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xl font-bold flex-shrink-0">
                          —
                        </span>
                      )}
                      {feature.tufPremium && (
                        <span className="text-sm text-muted-foreground">
                          {feature.tufPremium}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
        <div className="flex justify-center">
          <GradientButton className="mt-8" text="Show All Features" />
        </div>
      </div>
    </div>
  );
}

const CompareTypeSwitch = ({
  compareType,
  setCompareType,
}: {
  compareType: "TUF_FREE" | "OTHER_PLATFORMS";
  setCompareType: React.Dispatch<
    React.SetStateAction<"TUF_FREE" | "OTHER_PLATFORMS">
  >;
}) => {
  const compareTypes = [
    {
      key: "TUF_FREE",
      icon: IconAi,
      label: "Feature Details",
    },
    {
      key: "OTHER_PLATFORMS",
      icon: IconSettingsBolt,
      label: "Quick Compare",
    },
  ];

  return (
    <div
      onClick={() =>
        setCompareType(
          compareType === "TUF_FREE" ? "OTHER_PLATFORMS" : "TUF_FREE"
        )
      }
      className={cn(
        "cursor-pointer relative flex h-12 rounded-full bg-secondary p-1 font-jost ring-1 ring-border"
      )}
    >
      {compareTypes.map(({ key, icon: Icon, label }) => {
        const isActive = compareType === key;
        return (
          <button
            type="button"
            key={key}
            className="relative rounded-full cursor-pointer"
            aria-label={label}
          >
            {isActive && (
              <motion.div
                layoutId="activeClipType"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            {
              <span
                className={cn(
                  "relative m-auto px-4 font-[500]",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            }
          </button>
        );
      })}
    </div>
  );
};
