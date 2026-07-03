"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Droplets,
  Sun,
  Shield,
  Heart,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllSkinTypes } from "@/data/skinTypes";

const skinTypes = getAllSkinTypes();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const SkinTypesOverview = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#F7F9F8] py-20 md:py-28">
        <div className="absolute inset-0 opacity-50">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(83, 134, 112, 0.08) 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="container relative mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D8E2DC] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#355245] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Understanding Your Skin
            </span>
            <h1 className="font-heading text-4xl font-bold leading-tight text-[#262626] md:text-5xl lg:text-6xl">
              Know Your <span className="text-[#538670]">Skin Type</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#737373] md:text-xl">
              Every effective routine starts here. Learn the five core skin types,
              spot your own, and build a regimen that actually works for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Diagnostic CTA */}
      <section className="border-b border-[#E2E8E4] bg-white py-8">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-[#D8E2DC] bg-[#F7F9F8] p-6 md:flex-row md:p-8"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#355245] to-[#538670] shadow-md">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-[#262626]">
                  Not sure where you fit?
                </h2>
                <p className="text-sm text-[#737373]">
                  Take our quick, dermatologist-informed quiz and get a clear read.
                </p>
              </div>
            </div>
            <Link href="/analysis">
              <Button className="gap-2 rounded-xl bg-[#355245] px-6 py-5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#2A4136]">
                Take the Quiz
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Skin Types Grid */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="font-heading text-3xl font-bold text-[#262626] md:text-4xl">
                The five skin types
              </h2>
              <p className="mt-2 text-[#737373]">
                Each one has its own strengths, challenges, and ideal routine.
              </p>
            </div>
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-[#538670] md:block">
              Click a card to explore
            </span>
          </motion.div>

          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {skinTypes.map((skin) => {
              const Icon = skin.icon;
              return (
                <motion.div key={skin.slug} variants={itemVariants}>
                  <Link href={`/skin-types/${skin.slug}`}>
                    <article
                      className="group relative h-full overflow-hidden rounded-2xl border border-[#E2E8E4] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#355245]/20 hover:shadow-lg"
                    >
                      <div
                        className="absolute left-0 top-0 h-1 w-full"
                        style={{ backgroundColor: skin.tokens.accent }}
                      />
                      <div
                        className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: skin.tokens.wash,
                          color: skin.tokens.accent,
                        }}
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </div>
                      <h3 className="font-heading text-2xl font-bold text-[#262626]">
                        {skin.label}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#737373]">
                        {skin.tagline}
                      </p>

                      <ul className="mt-5 space-y-2">
                        {skin.characteristics.slice(0, 3).map((char, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-[#525252]"
                          >
                            <span
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: skin.tokens.accent }}
                            />
                            <span>{char}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold" style={{ color: skin.tokens.accent }}>
                        <span>Explore {skin.type}</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Comparison Snapshot */}
      <section className="bg-[#F7F9F8] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl font-bold text-[#262626] md:text-4xl">
              At a glance
            </h2>
            <p className="mt-2 text-[#737373]">
              How the five types differ across the things that matter most.
            </p>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-2xl border border-[#E2E8E4] bg-white shadow-sm"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#E2E8E4] bg-[#FAFBFA]">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#538670]">
                      Skin Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#538670]">
                      Pores
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#538670]">
                      Main Concern
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#538670]">
                      Hero Ingredient
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {skinTypes.map((skin, idx) => (
                    <tr
                      key={skin.slug}
                      className={`border-b border-[#E2E8E4] transition-colors hover:bg-[#F7F9F8] ${
                        idx % 2 === 1 ? "bg-[#FAFBFA]/50" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/skin-types/${skin.slug}`}
                          className="group inline-flex items-center gap-3"
                        >
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: skin.tokens.wash,
                              color: skin.tokens.accent,
                            }}
                          >
                            <skin.icon className="h-4 w-4" strokeWidth={1.8} />
                          </span>
                          <span className="font-semibold text-[#262626] transition-colors group-hover:text-[#538670]">
                            {skin.label}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#525252]">
                        {skin.slug === "oily" && "Large, visible"}
                        {skin.slug === "dry" && "Very small"}
                        {skin.slug === "combination" && "Varies by zone"}
                        {skin.slug === "sensitive" && "Small"}
                        {skin.slug === "normal" && "Small, even"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#525252]">
                        {skin.slug === "oily" && "Shine, congestion"}
                        {skin.slug === "dry" && "Tightness, flakiness"}
                        {skin.slug === "combination" && "Balancing zones"}
                        {skin.slug === "sensitive" && "Irritation, redness"}
                        {skin.slug === "normal" && "Maintenance"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#525252]">
                        {skin.slug === "oily" && "Niacinamide"}
                        {skin.slug === "dry" && "Ceramides"}
                        {skin.slug === "combination" && "Hyaluronic Acid"}
                        {skin.slug === "sensitive" && "Centella Asiatica"}
                        {skin.slug === "normal" && "Vitamin C"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Universal Tips */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-wider text-[#538670]">
                Universal habits
              </span>
              <h2 className="font-heading text-3xl font-bold text-[#262626] md:text-4xl">
                Foundations that work for every skin type
              </h2>
              <p className="mt-4 text-[#737373]">
                No matter your skin type, these habits protect your barrier, prevent
                premature aging, and keep your complexion healthy.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Wear SPF 30+ every single day",
                  "Remove makeup before bed",
                  "Patch test new products for 48 hours",
                  "Avoid very hot water on your face",
                  "Stay consistent — results take time",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F0EC]">
                      <CheckCircle className="h-3 w-3 text-[#355245]" />
                    </span>
                    <span className="text-[#525252]">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Droplets,
                  title: "Hydrate",
                  desc: "Inside and out",
                  bg: "bg-[#EEF5F3]",
                  color: "text-[#4A7C6F]",
                },
                {
                  icon: Sun,
                  title: "Protect",
                  desc: "SPF is non-negotiable",
                  bg: "bg-[#FAF6F2]",
                  color: "text-[#C8A48A]",
                },
                {
                  icon: Shield,
                  title: "Strengthen",
                  desc: "Barrier-first skincare",
                  bg: "bg-[#F0F4F0]",
                  color: "text-[#7A9B76]",
                },
                {
                  icon: Heart,
                  title: "Soothe",
                  desc: "Less is often more",
                  bg: "bg-[#FCF6F5]",
                  color: "text-[#C58A7F]",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`rounded-2xl ${item.bg} p-6 transition-transform duration-300 hover:-translate-y-1`}
                >
                  <item.icon className={`h-8 w-8 ${item.color}`} strokeWidth={1.8} />
                  <h3 className="mt-4 font-heading text-lg font-semibold text-[#262626]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#737373]">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SkinTypesOverview;
