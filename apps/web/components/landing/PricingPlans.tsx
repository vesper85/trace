"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  IconCalendar,
  IconCalendarFilled,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { GradientButton } from "./ui/GradientButton";

interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  originalPrice: number;
  regularPrice: number;
  discountPercentage: number;
  validity: string;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant: "primary" | "secondary" | "outline";
  isPopular?: boolean;
}

interface PricingFeature {
  text: string;
  included: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Beta",
    subtitle: "All essential debugging tools for Movement developers.",
    originalPrice: 0,
    regularPrice: 0,
    discountPercentage: 0,
    validity: "During Beta",
    features: [
      { text: "Transaction Simulator", included: true },
      { text: "VirtualNet Sessions", included: true },
      { text: "Contract Loader", included: true },
      { text: "Gas Analysis", included: true },
      { text: "State Inspector", included: true },
    ],
    buttonText: "Start for Free",
    buttonVariant: "primary",
    isPopular: true,
  },
  {
    id: "pro",
    name: "Pro (Coming Soon)",
    subtitle: "Advanced features for professional teams and protocols.",
    badge: "Coming Soon",
    originalPrice: 0,
    regularPrice: 0,
    discountPercentage: 0,
    validity: "",
    features: [
      { text: "All Free features", included: true },
      { text: "Unlimited VirtualNet sessions", included: true },
      { text: "API Access", included: true },
      { text: "Priority Support", included: true },
      { text: "Custom Integrations", included: false },
    ],
    buttonText: "Join Waitlist",
    buttonVariant: "outline",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subtitle:
      "Custom solutions for teams needing dedicated infrastructure and support.",
    features: [
      { text: "All Pro features", included: true },
      { text: "Dedicated Infrastructure", included: true },
      { text: "Custom Integrations", included: true },
      { text: "SLA Guarantee", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "On-premise Deployment", included: true },
    ],
    buttonText: "Contact Us",
    buttonVariant: "secondary",
    originalPrice: 0,
    regularPrice: 0,
    discountPercentage: 0,
    validity: "",
  },
];

export function PricingPlans() {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:text-left text-center"
        >
          <h2 className="md:text-3xl md:text-left text-xl text-center">
            Powerful Tools for{" "}
            <span className="text-orange-400">Every Developer</span>
          </h2>
          <p className="mb-4 text-muted-foreground">
            Start debugging for free during beta
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={cn(
                "relative rounded-3xl bg-secondary/30 flex flex-col justify-between p-8 border-4 transition-all duration-300 hover:scale-105",
                plan.isPopular
                  ? "border-orange-200/80 shadow-2xl md:scale-105"
                  : ""
              )}
            >
              <div>
                {plan.badge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="bg-gradient-to-r from-orange-500 to-orange-400 font-jost px-4 py-2 rounded-full text-sm font-medium">
                      {plan.badge}
                    </div>
                  </motion.div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-jost font-semibold mb-2 flex items-center gap-2">
                    {plan.name}
                  </h3>
                  <p className={"text-sm text-muted-foreground"}>
                    {plan.subtitle}
                  </p>
                </div>

                {plan.regularPrice > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <span
                        className={cn(
                          "text-lg line-through text-muted-foreground"
                        )}
                      >
                        Original: ₹{plan.originalPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className={cn("text-lg")}>
                        Regular: ₹{plan.regularPrice}
                      </span>
                      <span className="bg-orange-500 px-2 py-1 rounded text-sm font-medium">
                        {plan.discountPercentage}% OFF
                      </span>
                    </div>
                  </div>
                )}

                {plan.validity && (
                  <div className="mb-6 flex items-center gap-2">
                    <IconCalendarFilled className="w-5 h-5 text-muted-foreground" />
                    <span className={cn("text-sm")}>
                      Validity: {plan.validity}
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h4 className={cn("font-semibold mb-4")}>What's included</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.2 + featureIndex * 0.1,
                        }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center",
                            feature.included
                              ? "bg-orange-500"
                              : "bg-neutral-500"
                          )}
                        >
                          {feature.included ? (
                            <IconCheck className="w-3 h-3 text-white" />
                          ) : (
                            <IconX className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className={cn("text-sm")}>{feature.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              <GradientButton
                text={plan.buttonText}
                className="w-full py-4 px-6 font-semibold transition-all duration-300"
                variant={plan.isPopular ? "orange" : "white"}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
