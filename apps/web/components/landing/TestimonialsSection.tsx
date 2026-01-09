"use client";

import { TestimonialsColumn } from "@/components/landing/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "Trace has completely changed how I debug smart contracts on Movement. Being able to simulate transactions before deploying saved me hours of debugging.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sarah Chen",
    role: "Smart Contract Developer",
  },
  {
    text: "The VirtualNet feature is incredible. I can fork mainnet, test complex DeFi flows, and identify issues without risking real assets.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Alex Rivera",
    role: "DeFi Protocol Engineer",
  },
  {
    text: "Finally, a debugging tool built specifically for Movement! The gas analysis feature helps me optimize contracts before deployment.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Emily Watson",
    role: "Blockchain Developer",
  },
  {
    text: "The state inspector makes it easy to understand exactly what happens during transaction execution. Essential tool for any Move developer.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "James Park",
    role: "Protocol Architect",
  },
  {
    text: "Being able to load any contract and instantly see all available functions is a game-changer. Trace makes contract interaction so much easier.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Nina Patel",
    role: "Full Stack Web3 Developer",
  },
  {
    text: "I caught a critical bug in my lending protocol using Trace's simulation. The detailed error messages pointed me right to the issue.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Lisa Wang",
    role: "Security Researcher",
  },
  {
    text: "The session management in VirtualNet keeps all my test transactions organized. Perfect for testing multi-step operations.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "David Kim",
    role: "Backend Engineer",
  },
  {
    text: "Trace's beta on Movement Labs is exactly what the ecosystem needed. Can't wait to see what features come next!",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Maria Santos",
    role: "Ecosystem Developer",
  },
  {
    text: "From simulation to deployment, Trace covers the entire development workflow. It's become an essential part of my toolkit.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Tom Anderson",
    role: "Smart Contract Auditor",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsSection = () => {
  return (
    <section className="my-20 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="flex flex-col items-center justify-center mx-auto px-4"
      >
        <h2 className="md:text-3xl md:text-left text-xl text-center mb-10">
          What developers are saying about{" "}
          <span className="text-orange-500">Trace</span>
        </h2>
      </motion.div>

      <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
        <TestimonialsColumn testimonials={firstColumn} duration={15} />
        <TestimonialsColumn
          testimonials={secondColumn}
          className="hidden md:block"
          duration={19}
        />
        <TestimonialsColumn
          testimonials={thirdColumn}
          className="hidden lg:block"
          duration={17}
        />
      </div>
    </section>
  );
};
