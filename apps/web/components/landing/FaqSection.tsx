"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  faqs: FAQ[];
}

const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    faqs: [
      {
        id: "what-is-trace",
        question: "What is Trace?",
        answer:
          "Trace is a powerful suite of debugging and development tools for the Movement L1 blockchain. It helps developers simulate, debug, and test smart contract transactions before deploying to mainnet.",
      },
      {
        id: "how-to-start",
        question: "How do I get started with Trace?",
        answer:
          "Open the Simulator from the sidebar, enter a contract address (e.g., 0x1 for the core framework), and Trace will automatically fetch all available modules. Select a function and run your first simulation.",
      },
      {
        id: "supported-networks",
        question: "Which networks does Trace support?",
        answer:
          "Trace supports both Movement mainnet and testnet. You can simulate transactions on either network and create VirtualNet forks from any point in time.",
      },
      {
        id: "is-free",
        question: "Is Trace free to use?",
        answer:
          "Yes, Trace is currently in beta and free to use for all Movement developers. No account or payment is required to access the simulation and debugging tools.",
      },
    ],
  },
  {
    id: "simulator",
    name: "Transaction Simulator",
    faqs: [
      {
        id: "simulator-overview",
        question: "What can I do with the Transaction Simulator?",
        answer:
          "The simulator allows you to preview the execution of any Move function on the Movement network without actually submitting a transaction. You can simulate both entry (state-changing) and view (read-only) functions.",
      },
      {
        id: "load-contract",
        question: "How do I load a contract?",
        answer:
          "Enter any valid Movement address in the contract input field. Trace will automatically fetch all modules deployed at that address, parse the ABI, and display available entry and view functions for simulation.",
      },
      {
        id: "type-arguments",
        question: "What are type arguments?",
        answer:
          "Some functions are generic and require type arguments. For example: 0x1::aptos_coin::AptosCoin. Enter the full type path including address, module, and struct name.",
      },
      {
        id: "gas-config",
        question: "How do I configure gas parameters?",
        answer:
          "For entry functions, specify the Sender Address, Gas Limit (default: 100,000), and Gas Price in octas (default: 100). These parameters simulate the transaction execution costs.",
      },
      {
        id: "understand-results",
        question: "How do I understand simulation results?",
        answer:
          "A successful simulation shows: success status, gas used, emitted events, and state changes. Failed simulations display the error status with abort code, human-readable description, and error location.",
      },
    ],
  },
  {
    id: "virtualnet",
    name: "VirtualNet",
    faqs: [
      {
        id: "what-is-virtualnet",
        question: "What is VirtualNet?",
        answer:
          "VirtualNet creates a virtual copy (fork) of the Movement network, allowing you to execute multiple transactions without affecting the real network, fund test accounts, and review transaction history within isolated sessions.",
      },
      {
        id: "create-session",
        question: "How do I create a VirtualNet session?",
        answer:
          "Navigate to VirtualNet from the sidebar, click Create Session, enter a descriptive session name, select the network to fork (mainnet or testnet), and click Create. Your session will be ready for transactions.",
      },
      {
        id: "fund-account",
        question: "How do I fund test accounts?",
        answer:
          "Within a session, click Fund Account, enter the account address and specify the amount in APT. The account will receive simulated tokens that can be used for testing transactions.",
      },
      {
        id: "tx-history",
        question: "How do I view transaction history?",
        answer:
          "Each session maintains a complete history of operations including: operation index, function called, status, gas used, emitted events, and state changes. Click any operation card to view detailed information.",
      },
    ],
  },
  {
    id: "debugging",
    name: "Debugging & Errors",
    faqs: [
      {
        id: "failed-tx",
        question: "How do I debug a failed transaction?",
        answer:
          "Failed operations show detailed error information including the error code, human-readable description, and the module location where the abort occurred. Use this to identify and fix issues in your smart contract.",
      },
      {
        id: "state-changes",
        question: "How do I inspect state changes?",
        answer:
          "Click on any operation card to expand and view: Events (all emitted events with their data), Resources (state changes with before/after values), and Inputs (parameters passed to the function).",
      },
      {
        id: "replay-sequences",
        question: "Can I replay transaction sequences?",
        answer:
          "Yes, create a VirtualNet session forked at the right block, replay transactions one by one, and identify which step fails and why. This is useful for debugging complex DeFi interactions.",
      },
    ],
  },
  {
    id: "use-cases",
    name: "Use Cases",
    faqs: [
      {
        id: "defi-testing",
        question: "How can I test DeFi interactions?",
        answer:
          "Fund an account with APT, swap APT for USDC, supply USDC to a lending protocol, borrow against collateral - test the entire flow without risking real assets using VirtualNet sessions.",
      },
      {
        id: "pre-deploy",
        question: "Can I test contracts before deploying?",
        answer:
          "Yes, before deploying to testnet: deploy your contract to VirtualNet, test all entry points, and verify edge cases and error handling in an isolated environment.",
      },
      {
        id: "debug-sequences",
        question: "How do I debug transaction sequences?",
        answer:
          "When a series of transactions fails: create a session forked at the right block, replay transactions one by one, and identify which step fails and why using the detailed error information.",
      },
    ],
  },
  {
    id: "technical",
    name: "Technical Support",
    faqs: [
      {
        id: "browser-support",
        question: "Which browsers are supported?",
        answer:
          "Trace works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of Chrome.",
      },
      {
        id: "report-issue",
        question: "How do I report an issue?",
        answer:
          "If you encounter any issues, please report them through our Discord community or GitHub repository. Include the transaction details, error messages, and steps to reproduce the issue.",
      },
      {
        id: "api-access",
        question: "Is there API access available?",
        answer:
          "API access is currently in development. Join our Discord community to stay updated on the latest features and API availability.",
      },
    ],
  },
];

export function FaqSection() {
  const [activeCategory, setActiveCategory] = useState("course-content");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>("dsa-topics");

  const currentCategory = faqCategories.find(
    (cat) => cat.id === activeCategory
  );

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="md:text-3xl md:text-left text-xl text-center">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-4 hidden lg:block"
          >
            <div className="rounded-2xl sticky top-8">
              <div className="space-y-2">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setExpandedFAQ(null);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between group",
                      activeCategory === category.id
                        ? "bg-gradient-to-r from-orange-500 to-orange-400"
                        : "text-muted-foreground hover:text-white"
                    )}
                  >
                    <span className="font-medium">{category.name}</span>
                    <svg
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        activeCategory === category.id
                          ? "rotate-90"
                          : "group-hover:rotate-90"
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="lg:hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-2 pb-2 min-w-max">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setExpandedFAQ(null);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                      activeCategory === category.id
                        ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-8"
          >
            <div className="bg-secondary/50 border rounded-2xl md:p-6 p-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    {currentCategory?.faqs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="border bg-secondary rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full px-3 md:px-6 py-4 text-left flex items-center justify-between hover:bg-secondary/80 transition-colors"
                        >
                          <span className="font-medium">
                            {faq.question}
                          </span>
                          <svg
                            className={cn(
                              "w-5 h-5 text-muted-foreground transition-transform duration-200",
                              expandedFAQ === faq.id ? "rotate-180" : ""
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                expandedFAQ === faq.id
                                  ? "M19 9l-7 7-7-7"
                                  : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                              }
                            />
                          </svg>
                        </button>

                        <AnimatePresence>
                          {expandedFAQ === faq.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 py-4 border-t bg-secondary/50">
                                <p className="text-muted-foreground leading-relaxed md:text-base text-sm">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 mx-4 md:mx-0 bg-secondary/60 border rounded-2xl p-8"
        >
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center flex-wrap gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  Need Help?
                </h3>
                <p className="text-muted-foreground">
                  Join our Discord community for support and updates
                </p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-orange-500 to-orange-400 hover:bg-orange-600 px-6 py-3 rounded-lg font-medium transition-colors md:mt-0 mt-4">
              Join Discord
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
