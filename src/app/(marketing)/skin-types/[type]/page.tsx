"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ShoppingBag,
  Sparkles,
  Sun,
  Moon,
  Droplets,
  AlertCircle,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/shop/ProductCard";
import { useEffect, useState } from 'react';
import type { Product } from "@/types/product";
import { getSkinType, type SkinTypeConfig } from "@/data/skinTypes";

const validSkinTypes = ["oily", "dry", "combination", "sensitive", "normal"] as const;

type ValidSkinType = (typeof validSkinTypes)[number];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const HeroSection = ({ data }: { data: SkinTypeConfig }) => {
  const Icon = data.icon;
  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{ backgroundColor: data.tokens.wash }}
    >
      <div
        className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-40 blur-3xl md:h-96 md:w-96"
        style={{ backgroundColor: data.tokens.accent }}
      />
      <div className="container relative mx-auto px-4">
        <Link
          href="/skin-types"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#355245]"
          style={{ color: data.tokens.accentDark }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all skin types
        </Link>

        <motion.div
          className="max-w-4xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl shadow-lg md:h-24 md:w-24"
              style={{
                backgroundColor: data.tokens.accent,
                color: data.tokens.accentForeground,
              }}
            >
              <Icon className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold text-[#262626] md:text-5xl lg:text-6xl">
                {data.type} Skin
              </h1>
              <p
                className="mt-2 text-lg font-medium md:text-xl"
                style={{ color: data.tokens.accentDark }}
              >
                {data.tagline}
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#525252]">
            {data.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const QuickActions = ({ skinType }: { skinType: string }) => (
  <section className="border-b border-[#E2E8E4] bg-white py-6">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap gap-3">
        <Link href="/analysis">
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-[#D8E2DC] text-[#355245] hover:bg-[#F7F9F8]"
          >
            <Sparkles className="h-4 w-4" />
            Retake Quiz
          </Button>
        </Link>
        <Link href={`/shop?skinType=${skinType}`}>
          <Button
            className="gap-2 rounded-xl bg-[#355245] text-white hover:bg-[#2A4136]"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop Products
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const CharacteristicsSection = ({ data }: { data: SkinTypeConfig }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    <h2 className="font-heading text-2xl font-bold text-[#262626] md:text-3xl">
      Key Characteristics
    </h2>
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Card className="border-[#E2E8E4] bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5" style={{ color: data.tokens.accent }} />
            Signs & Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.characteristics.map((char, i) => (
              <li key={i} className="flex items-start gap-3 text-[#525252]">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: data.tokens.accent }}
                />
                <span>{char}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-[#E2E8E4] bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-[#854438]" />
            Common Causes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.causes.map((cause, i) => (
              <li key={i} className="flex items-start gap-3 text-[#525252]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C58A7F]" />
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  </motion.section>
);

const GoodAndChallenging = ({ data }: { data: SkinTypeConfig }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    <h2 className="font-heading text-2xl font-bold text-[#262626] md:text-3xl">
      The good & the challenging
    </h2>
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Card
        className="border-0 shadow-sm"
        style={{ backgroundColor: "#F4FAF7" }}
      >
        <CardHeader className="pb-3">
          <CardTitle
            className="flex items-center gap-2 text-lg"
            style={{ color: "#355245" }}
          >
            <CheckCircle className="h-5 w-5" />
            Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3 text-[#525252]">
                <CheckCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: "#538670" }}
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card
        className="border-0 shadow-sm"
        style={{ backgroundColor: "#FCF8F5" }}
      >
        <CardHeader className="pb-3">
          <CardTitle
            className="flex items-center gap-2 text-lg"
            style={{ color: "#854438" }}
          >
            <AlertCircle className="h-5 w-5" />
            Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.challenges.map((challenge, i) => (
              <li key={i} className="flex items-start gap-3 text-[#525252]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#C58A7F]" />
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  </motion.section>
);

const RoutineCard = ({
  title,
  icon: Icon,
  routine,
  accent,
}: {
  title: string;
  icon: React.ElementType;
  routine: SkinTypeConfig["morningRoutine"];
  accent: string;
}) => (
  <Card className="h-full border-[#E2E8E4] bg-white shadow-sm">
    <CardHeader
      className="rounded-t-lg pb-4"
      style={{ backgroundColor: "#F7F9F8" }}
    >
      <CardTitle className="flex items-center gap-2 text-lg text-[#262626]">
        <Icon className="h-5 w-5" style={{ color: accent }} />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="relative space-y-6 pl-4">
        <div
          className="absolute left-[19px] top-2 h-[calc(100%-16px)] w-px"
          style={{ backgroundColor: "#E2E8E4" }}
        />
        {routine.map((step, i) => (
          <div key={i} className="relative pl-7">
            <div
              className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {i + 1}
            </div>
            <h4 className="font-semibold text-[#262626]">{step.step}</h4>
            <p className="mt-1 text-sm leading-relaxed text-[#737373]">
              {step.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {step.products.map((product, j) => (
                <Badge
                  key={j}
                  variant="secondary"
                  className="border-0 bg-[#F0F4F2] text-xs font-normal text-[#355245] hover:bg-[#E8F0EC]"
                >
                  {product}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const RoutinesSection = ({ data }: { data: SkinTypeConfig }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    <h2 className="font-heading text-2xl font-bold text-[#262626] md:text-3xl">
      Recommended routines
    </h2>
    <p className="mt-2 text-[#737373]">
      A simple, effective routine tailored to {data.type.toLowerCase()} skin.
    </p>
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <RoutineCard
        title="Morning Routine"
        icon={Sun}
        routine={data.morningRoutine}
        accent={data.tokens.accent}
      />
      <RoutineCard
        title="Night Routine"
        icon={Moon}
        routine={data.nightRoutine}
        accent={data.tokens.accent}
      />
    </div>
  </motion.section>
);

const IngredientsSection = ({ data }: { data: SkinTypeConfig }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    <h2 className="font-heading text-2xl font-bold text-[#262626] md:text-3xl">
      Ingredient guide
    </h2>
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <Card className="border-[#E2E8E4] bg-white shadow-sm">
        <CardHeader
          className="rounded-t-lg pb-3"
          style={{ backgroundColor: "#F4FAF7" }}
        >
          <CardTitle className="flex items-center gap-2 text-lg text-[#355245]">
            <Droplets className="h-5 w-5 text-[#538670]" />
            Beneficial Ingredients
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-4">
            {data.ingredients.beneficial.map((ing, i) => (
              <div key={i}>
                <h4 className="font-semibold text-[#355245]">{ing.name}</h4>
                <p className="mt-0.5 text-sm leading-relaxed text-[#737373]">
                  {ing.benefit}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E2E8E4] bg-white shadow-sm">
        <CardHeader
          className="rounded-t-lg pb-3"
          style={{ backgroundColor: "#FCF5F4" }}
        >
          <CardTitle className="flex items-center gap-2 text-lg text-[#854438]">
            <AlertCircle className="h-5 w-5 text-[#C58A7F]" />
            Ingredients to Avoid
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-4">
                {data.ingredients.avoid.map((ing, i) => (
              <div key={i}>
                <h4 className="font-semibold text-[#854438]">{ing.name}</h4>
                <p className="mt-0.5 text-sm leading-relaxed text-[#737373]">
                  {ing.reason || ing.benefit}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </motion.section>
);

const LifestyleSection = ({ data }: { data: SkinTypeConfig }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    <h2 className="font-heading text-2xl font-bold text-[#262626] md:text-3xl">
      Lifestyle & care tips
    </h2>
    <Card
      className="mt-6 border-[#E2E8E4] bg-white shadow-sm"
    >
      <CardContent className="grid gap-4 py-6 md:grid-cols-2">
        {data.lifestyle.map((tip, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: data.tokens.accent }}
            />
            <span className="text-[#525252]">{tip}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  </motion.section>
);

const MythsSection = ({ data }: { data: SkinTypeConfig }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="rounded-3xl bg-[#F7F9F8] p-6 md:p-10"
  >
    <h2 className="font-heading text-2xl font-bold text-[#262626] md:text-3xl">
      Myths debunked
    </h2>
    <div className="mt-6 space-y-4">
      {data.myths.map((item, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="py-5">
            <div className="flex flex-col gap-4 md:flex-row md:gap-6">
              <div className="flex shrink-0 items-start gap-3 md:w-1/2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FCF5F4]">
                  <span className="text-sm font-bold text-[#C58A7F]">×</span>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C58A7F]">
                    Myth
                  </span>
                  <p className="mt-1 font-medium text-[#262626]">{item.myth}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:w-1/2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F4FAF7]">
                  <CheckCircle className="h-4 w-4 text-[#538670]" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#538670]">
                    Truth
                  </span>
                  <p className="mt-1 text-[#525252]">{item.truth}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </motion.section>
);

const ProTipsSection = ({ data }: { data: SkinTypeConfig }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    <Card
      className="border-0 text-white shadow-md"
      style={{
        background: `linear-gradient(135deg, ${data.tokens.accent} 0%, ${data.tokens.accentDark} 100%)`,
      }}
    >
      <CardContent className="p-6 md:p-10">
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold md:text-3xl">
          <Sparkles className="h-6 w-6" />
          Pro tips for {data.type} skin
        </h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {data.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3">
              <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 opacity-80" />
              <span className="opacity-95">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </motion.section>
);

const ProductsSection = ({
  data,
  skinType,
}: {
  data: SkinTypeConfig;
  skinType: ValidSkinType;
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) setProducts(await res.json());
      } catch {}
    })();
  }, []);

  const recommendedProducts = products
    .filter((p) => p.skinTypes.includes(skinType))
    .slice(0, 4);

  if (recommendedProducts.length === 0) return null;

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-2xl font-bold text-[#262626] md:text-3xl">
          Recommended products
        </h2>
        <Link href={`/shop?skinType=${skinType}`}>
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-[#D8E2DC] text-[#355245] hover:bg-[#F7F9F8]"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {recommendedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </motion.section>
  );
};

const CTASection = ({ data, skinType }: { data: SkinTypeConfig; skinType: string }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="rounded-3xl bg-gradient-to-br from-[#355245] to-[#538670] p-8 text-center text-white md:p-12"
  >
    <h2 className="font-heading text-2xl font-bold md:text-3xl">
      Ready to build your perfect routine?
    </h2>
    <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">
      Explore products curated for {data.type.toLowerCase()} skin, or retake the quiz
      to confirm your type.
    </p>
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <Link href={`/shop?skinType=${skinType}`}>
        <Button
          size="lg"
          className="gap-2 rounded-xl bg-white px-6 text-[#355245] shadow-lg hover:bg-[#F7F9F8]"
        >
          <ShoppingBag className="h-5 w-5" />
          Shop {data.type} Skin Products
        </Button>
      </Link>
      <Link href="/analysis">
        <Button
          size="lg"
          variant="outline"
          className="gap-2 rounded-xl border-white/30 bg-white/10 px-6 text-white hover:bg-white/20"
        >
          <Sparkles className="h-5 w-5" />
          Take the Quiz
        </Button>
      </Link>
    </div>
  </motion.section>
);

const SkinTypeDetail = () => {
  const params = useParams();
  const router = useRouter();
  const type = params?.type as string | undefined;
  const skinType = type?.toLowerCase();

  if (!skinType || !validSkinTypes.includes(skinType as ValidSkinType)) {
    router.replace("/skin-types");
    return null;
  }

  const data = getSkinType(skinType);
  if (!data) {
    router.replace("/skin-types");
    return null;
  }

  return (
    <>
      <HeroSection data={data} />
      <QuickActions skinType={skinType} />

      <div className="container mx-auto px-4 py-12 md:py-20 space-y-16 md:space-y-20">
        <CharacteristicsSection data={data} />
        <GoodAndChallenging data={data} />
        <RoutinesSection data={data} />
        <IngredientsSection data={data} />
        <LifestyleSection data={data} />
        <MythsSection data={data} />
        <ProTipsSection data={data} />
        <ProductsSection data={data} skinType={skinType as ValidSkinType} />
        <CTASection data={data} skinType={skinType} />
      </div>
    </>
  );
};

export default SkinTypeDetail;
