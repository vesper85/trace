"use client";

import React, { useState } from "react";
import { AnimatedTabs, Tab } from "./ui/animated-tabs";
import {
  IconPlus,
  IconChevronRight,
  IconFolder,
  IconFile,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/landing/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface CourseCardProps {
  title: string;
  description: string;
  topics: string;
  contests: string;
  problems: string;
  icon: React.ReactNode;
  syllabusData: SyllabusItem[];
}

interface SyllabusItem {
  id: string;
  title: string;
  type: "folder" | "file";
  children?: SyllabusItem[];
}

const dsaSyllabus: SyllabusItem[] = [
  {
    id: "beginner",
    title: "Beginner Problems",
    type: "folder",
    children: [
      {
        id: "language-basics",
        title: "Language Basics",
        type: "folder",
        children: [
          { id: "variables", title: "Variables & Data Types", type: "file" },
          { id: "operators", title: "Operators", type: "file" },
          { id: "conditions", title: "Conditional Statements", type: "file" },
          { id: "loops", title: "Loops", type: "file" },
        ],
      },
      {
        id: "logic-building",
        title: "Logic Building (Patterns)",
        type: "folder",
        children: [
          { id: "easy-medium", title: "Easy and Medium", type: "file" },
          { id: "hard", title: "Hard", type: "file" },
        ],
      },
      {
        id: "patterns",
        title: "Patterns",
        type: "folder",
        children: [
          { id: "pattern1", title: "Pattern 1", type: "file" },
          { id: "pattern2", title: "Pattern 2", type: "file" },
          { id: "pattern3", title: "Pattern 3", type: "file" },
          { id: "pattern4", title: "Pattern 4", type: "file" },
        ],
      },
    ],
  },
  {
    id: "intermediate",
    title: "Intermediate Topics",
    type: "folder",
    children: [
      { id: "arrays", title: "Arrays", type: "file" },
      { id: "strings", title: "Strings", type: "file" },
      { id: "sorting", title: "Sorting Algorithms", type: "file" },
      { id: "searching", title: "Searching Algorithms", type: "file" },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Topics",
    type: "folder",
    children: [
      { id: "dp", title: "Dynamic Programming", type: "file" },
      { id: "graphs", title: "Graph Algorithms", type: "file" },
      { id: "trees", title: "Tree Algorithms", type: "file" },
    ],
  },
];

function SyllabusTree({
  items,
  level = 0,
}: {
  items: SyllabusItem[];
  level?: number;
}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>();

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className={level > 0 ? "ml-6" : ""}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="mb-2"
        >
          <motion.div
            className={`flex items-center gap-2 p-1.5 rounded hover:bg-secondary cursor-pointer transition-colors ${
              item.id === "language-basics"
                ? "bg-orange-600/20 text-orange-400"
                : ""
            }`}
            onClick={() => item.type === "folder" && toggleExpanded(item.id)}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            {item.type === "folder" ? (
              <>
                <motion.div
                  animate={{ rotate: expandedItems?.has(item.id) ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconChevronRight className="w-4 h-4" />
                </motion.div>
              </>
            ) : (
              <>
                <div className="w-4" />
              </>
            )}
            <span className="text-sm">{item.title}</span>
          </motion.div>

          <AnimatePresence>
            {item.type === "folder" &&
              item.children &&
              expandedItems?.has(item.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="overflow-hidden"
                >
                  <SyllabusTree items={item.children} level={level + 1} />
                </motion.div>
              )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function CourseCard({
  title,
  description,
  topics,
  contests,
  problems,
  icon,
  syllabusData,
}: CourseCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="rounded-3xl shadow-sm ring ring-border p-6 border-[8px] border-border/50 flex flex-col justify-between hover:shadow-lg hover:scale-105 hover:bg-secondary/50 transition-all duration-300 cursor-pointer group">
        <div className="">
          <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors duration-300">
            {title}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <IconPlus className="w-4 h-4 text-orange-500 group-hover:rotate-90 transition-transform duration-300" />
              <span>{topics}</span>
            </div>
            {contests && (
              <div className="flex items-center gap-2">
                <IconPlus className="w-4 h-4 text-orange-500 group-hover:rotate-90 transition-transform duration-300" />
                <span>{contests}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <IconPlus className="w-4 h-4 text-orange-500 group-hover:rotate-90 transition-transform duration-300" />
              <span>{problems}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center my-6">
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full bg-neutral-800 hover:bg-gradient-to-r from-orange-500 to-orange-400 text-white py-2 px-4 rounded-lg transition-all duration-300 group-hover:bg-gradient-to-r from-orange-500 to-orange-400 group-hover:shadow-md"
          >
            View Syllabus
          </button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="h-[80vh] flex flex-col sm:w-[700px] rounded-3xl overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                <span className="font-bold text-sm uppercase">{title[0]}</span>
              </div>
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Complete syllabus and course structure
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto scrollbar-hide max-h-[60vh] pr-2">
            <SyllabusTree items={syllabusData} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

const simulatorSyllabus: SyllabusItem[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    type: "folder",
    children: [
      { id: "load-contract", title: "Loading a Contract", type: "file" },
      { id: "select-function", title: "Selecting Functions", type: "file" },
      { id: "run-simulation", title: "Running Simulations", type: "file" },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Features",
    type: "folder",
    children: [
      { id: "type-args", title: "Type Arguments", type: "file" },
      { id: "gas-config", title: "Gas Configuration", type: "file" },
      { id: "view-results", title: "Understanding Results", type: "file" },
    ],
  },
];

const virtualNetSyllabus: SyllabusItem[] = [
  {
    id: "sessions",
    title: "Session Management",
    type: "folder",
    children: [
      { id: "create-session", title: "Creating Sessions", type: "file" },
      { id: "network-fork", title: "Network Forking", type: "file" },
      { id: "manage-sessions", title: "Managing Sessions", type: "file" },
    ],
  },
  {
    id: "transactions",
    title: "Transaction Execution",
    type: "folder",
    children: [
      { id: "send-tx", title: "Sending Transactions", type: "file" },
      { id: "fund-account", title: "Funding Accounts", type: "file" },
      { id: "tx-history", title: "Transaction History", type: "file" },
    ],
  },
];

const debuggingSyllabus: SyllabusItem[] = [
  {
    id: "error-analysis",
    title: "Error Analysis",
    type: "folder",
    children: [
      { id: "abort-codes", title: "Abort Codes", type: "file" },
      { id: "error-location", title: "Error Location", type: "file" },
      { id: "gas-errors", title: "Gas Errors", type: "file" },
    ],
  },
  {
    id: "state-inspection",
    title: "State Inspection",
    type: "folder",
    children: [
      { id: "events", title: "Emitted Events", type: "file" },
      { id: "resources", title: "Resource Changes", type: "file" },
      { id: "return-values", title: "Return Values", type: "file" },
    ],
  },
];

export function TabsSection() {
  const tabsSyllabusData: Tab[] = [
    {
      id: "simulator",
      label: "Simulator",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard
            title="Transaction Simulator"
            description="Simulate any entry or view function on Movement mainnet or testnet"
            topics="Entry & View Functions"
            contests=""
            problems="Unlimited Simulations"
            icon={<div className="text-white">🎮</div>}
            syllabusData={simulatorSyllabus}
          />
          <CourseCard
            title="Contract Loader"
            description="Load any contract by address and auto-discover modules and functions"
            topics="Auto Module Discovery"
            contests=""
            problems="ABI Parsing"
            icon={<div className="text-white">📦</div>}
            syllabusData={simulatorSyllabus}
          />
          <CourseCard
            title="Gas Analysis"
            description="Preview gas usage before executing transactions on-chain"
            topics="Gas Breakdown"
            contests=""
            problems="Cost Optimization"
            icon={<div className="text-white">⛽</div>}
            syllabusData={simulatorSyllabus}
          />
        </div>
      ),
    },
    {
      id: "virtualnet",
      label: "VirtualNet",
      isNew: true,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard
            title="Forked Networks"
            description="Create virtual forks of mainnet or testnet for isolated testing"
            topics="Mainnet & Testnet Forks"
            contests=""
            problems="Isolated Environments"
            icon={<div className="text-white">🌐</div>}
            syllabusData={virtualNetSyllabus}
          />
          <CourseCard
            title="Session Management"
            description="Create, manage, and track testing sessions with full history"
            topics="Unique Session IDs"
            contests=""
            problems="Complete History"
            icon={<div className="text-white">📁</div>}
            syllabusData={virtualNetSyllabus}
          />
          <CourseCard
            title="Fund Accounts"
            description="Fund test accounts with simulated tokens for testing"
            topics="Simulated APT"
            contests=""
            problems="Instant Funding"
            icon={<div className="text-white">💰</div>}
            syllabusData={virtualNetSyllabus}
          />
        </div>
      ),
    },
    {
      id: "debugging",
      label: "Debugging",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard
            title="Error Analysis"
            description="Get detailed error messages with abort codes and locations"
            topics="Human-readable Errors"
            contests=""
            problems="Abort Code Lookup"
            icon={<div className="text-white">🔍</div>}
            syllabusData={debuggingSyllabus}
          />
          <CourseCard
            title="State Inspector"
            description="View events, resource changes, and state modifications"
            topics="Event Viewer"
            contests=""
            problems="Resource Tracking"
            icon={<div className="text-white">🔬</div>}
            syllabusData={debuggingSyllabus}
          />
          <CourseCard
            title="Transaction History"
            description="Track all operations with detailed execution results"
            topics="Operation Logs"
            contests=""
            problems="Before/After States"
            icon={<div className="text-white">📊</div>}
            syllabusData={debuggingSyllabus}
          />
        </div>
      ),
    },
    {
      id: "use-cases",
      label: "Use Cases",
      isNew: true,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard
            title="DeFi Testing"
            description="Test complete DeFi flows - swaps, lending, borrowing without risk"
            topics="Full Flow Testing"
            contests=""
            problems="Risk-Free Transactions"
            icon={<div className="text-white">💱</div>}
            syllabusData={virtualNetSyllabus}
          />
          <CourseCard
            title="Debug Sequences"
            description="Replay failed transaction sequences and identify issues"
            topics="Step-by-Step Replay"
            contests=""
            problems="Issue Identification"
            icon={<div className="text-white">🐛</div>}
            syllabusData={debuggingSyllabus}
          />
          <CourseCard
            title="Pre-deploy Testing"
            description="Test contracts on VirtualNet before deploying to testnet"
            topics="Safe Deployment"
            contests=""
            problems="Edge Case Testing"
            icon={<div className="text-white">🚀</div>}
            syllabusData={virtualNetSyllabus}
          />
        </div>
      ),
    },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 my-32">
      <h2 className="md:text-3xl md:text-left text-xl text-center mb-10">
        Everything you need to{" "}
        <span className="text-orange-500 ">Debug Smart Contracts</span>
      </h2>
      <div className="flex justify-center">
        <AnimatedTabs tabs={tabsSyllabusData} className="w-full max-w-none" />
      </div>
    </div>
  );
}
