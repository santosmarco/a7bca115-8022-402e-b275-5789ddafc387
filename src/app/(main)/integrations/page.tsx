"use client";

import { motion } from "framer-motion";
import { ArrowRight, Puzzle } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const upcomingIntegrations = [
  {
    name: "Slack",
    description: "Share moments and insights directly to your Slack channels.",
    comingSoon: true,
  },
  {
    name: "Microsoft Teams",
    description:
      "Seamlessly integrate meeting insights with your Teams workspace.",
    comingSoon: true,
  },
  {
    name: "Notion",
    description:
      "Export meeting summaries and moments to your Notion workspace.",
    comingSoon: true,
  },
  {
    name: "Zoom",
    description: "Automatically analyze and process your Zoom recordings.",
    comingSoon: true,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl space-y-12"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
          >
            <Puzzle className="h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="mb-4 text-4xl font-bold">Integrations</h1>
          <p className="text-lg text-muted-foreground">
            Connect Titan with your favorite tools and supercharge your
            workflow.
          </p>
        </motion.div>

        {/* Integration Grid */}
        <motion.div
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          {upcomingIntegrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-2 border-border p-6 transition-colors duration-300 hover:border-primary/50">
                <div className="absolute -right-12 -top-12 h-24 w-24 rotate-45 bg-gradient-to-br from-primary/10 to-transparent" />
                <h3 className="mb-2 text-xl font-semibold">
                  {integration.name}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {integration.description}
                </p>
                <Button
                  variant="outline"
                  className="group/btn relative overflow-hidden"
                  disabled
                >
                  <span className="relative z-10">Coming Soon</span>
                  <motion.div
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    className="absolute inset-0 z-0 bg-primary opacity-0 transition-opacity duration-300 group-hover/btn:opacity-10"
                  />
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <Link href="mailto:support@withtitan.com">
            <Button size="lg" className="group relative">
              Request an Integration
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 2, opacity: 0.1 }}
                className="absolute inset-0 z-0 rounded-full bg-primary"
              />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
