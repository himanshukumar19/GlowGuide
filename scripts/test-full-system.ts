export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const MEDICAL_DISCLAIMER = /not medical advice/i;

const KNOWN_BRANDS = [
  "Cetaphil", "CeraVe", "Cerave", "cerave", "cetaphil",
  "Neutrogena", "La Roche-Posay", "La Roche Posay", "Laroche",
  "The Ordinary", "Drunk Elephant", "Glow Recipe", "Kiehl's", "Kiehls",
  "Olay", "Clinique", "L'Oreal", "L'Oréal", "Loreal",
  "EltaMD", "Elta MD", "SkinCeuticals", "Skinceuticals",
  "Vanicream", "Aveeno", "Eucerin", "Paula's Choice", "Paulas Choice",
  "COSRX", "Cosrx", "Innisfree", "Laneige", "Tatcha",
];

type TestResult = {
  name: string;
  category: string;
  question: string;
  passed: boolean;
  detail: string;
  provider?: string;
  sources?: { title: string; url: string; sourceType: string }[];
  usedWebFallback?: boolean;
  durationMs: number;
};

const results: TestResult[] = [];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runOne(
  category: string,
  name: string,
  question: string,
  check: (result: {
    answer: string;
    sources: { title: string; url: string; sourceType: string }[];
    provider: string;
    usedWebFallback: boolean;
  }) => { passed: boolean; detail: string }
): Promise<void> {
  console.log(`\n━━━ ${category}: ${name} ━━━`);
  console.log(`  Q: ${question}`);
  const start = Date.now();

  try {
    const { answerQuery } = await import("../src/lib/rag/retrieve");
    const qr = await answerQuery(question);
    const durationMs = Date.now() - start;

    const { passed, detail } = check(qr);

    console.log(`  Provider: ${qr.provider}`);
    console.log(`  Web fallback: ${qr.usedWebFallback}`);
    console.log(`  Sources (${qr.sources.length}):`);
    for (const s of qr.sources) {
      console.log(`    - [${s.sourceType}] ${s.title}  (${s.url.slice(0, 70)}...)`);
    }
    console.log(`  Duration: ${durationMs}ms`);
    console.log(`  ${passed ? "PASS" : "FAIL"}: ${detail}`);

    results.push({
      name,
      category,
      question,
      passed,
      detail,
      provider: qr.provider,
      sources: qr.sources,
      usedWebFallback: qr.usedWebFallback,
      durationMs,
    });
  } catch (err) {
    const durationMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  Duration: ${durationMs}ms`);
    console.log(`  FAIL: threw error — ${msg}`);
    results.push({ name, category, question, passed: false, detail: `Threw: ${msg}`, durationMs });
  }
}

function extractSourceText(sources: { title: string; url: string }[]): string {
  return sources.map((s) => `${s.title} ${s.url}`).join(" ");
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("GlowGuide Full-System RAG Smoke Test");
  console.log("═══════════════════════════════════════════\n");

  // ── 1. GREETING DETECTION ────────────────────────────────────
  await runOne("GREETING", "hello-greeting", "hello", (r) => {
    if (r.sources.length > 0) return { passed: false, detail: "Expected 0 sources, got " + r.sources.length };
    if (MEDICAL_DISCLAIMER.test(r.answer)) return { passed: false, detail: "Greeting should NOT contain medical disclaimer" };
    const isFriendly =
      /hi|hello|hey|welcome|help|assist|how can/i.test(r.answer);
    return {
      passed: isFriendly && r.sources.length === 0,
      detail: isFriendly ? "Returned friendly skincare greeting with no sources or disclaimer" : "Did not detect greeting tone — answer: " + r.answer.slice(0, 100),
    };
  });

  await sleep(800);

  await runOne("GREETING", "thanks-acknowledgment", "thanks", (r) => {
    if (r.sources.length > 0) return { passed: false, detail: "Expected 0 sources, got " + r.sources.length };
    if (MEDICAL_DISCLAIMER.test(r.answer)) return { passed: false, detail: "Thanks should NOT contain medical disclaimer" };
    const isAck =
      /welcome|glad|happy|pleasure|anytime|here to help|no problem/i.test(r.answer);
    return {
      passed: isAck,
      detail: isAck ? "Returned friendly acknowledgment with no sources or disclaimer" : "Did not detect thanks acknowledgment — answer: " + r.answer.slice(0, 100),
    };
  });

  await sleep(800);

  // ── 2. OFF-TOPIC DETECTION ───────────────────────────────────
  await runOne("OFF_TOPIC", "poem-redirect", "write a poem about skin", (r) => {
    if (r.sources.length > 0) return { passed: false, detail: "Expected 0 sources, got " + r.sources.length };
    if (MEDICAL_DISCLAIMER.test(r.answer)) return { passed: false, detail: "Off-topic should NOT contain medical disclaimer" };
    const isRedirect =
      /skincare|skin care|specifically designed|help with.*skin|skincare.*question/i.test(r.answer);
    return {
      passed: isRedirect,
      detail: isRedirect ? "Politely redirected to skincare topics, no sources" : "Did not redirect — answer: " + r.answer.slice(0, 100),
    };
  });

  await sleep(800);

  await runOne("OFF_TOPIC", "france-redirect", "what's the capital of France", (r) => {
    if (r.sources.length > 0) return { passed: false, detail: "Expected 0 sources, got " + r.sources.length };
    const isRedirect =
      /skincare|skin care|specifically designed|help with.*skin|skincare.*question/i.test(r.answer);
    return {
      passed: isRedirect,
      detail: isRedirect ? "Politely redirected to skincare topics, no sources" : "Did not redirect — answer: " + r.answer.slice(0, 100),
    };
  });

  await sleep(800);

  // ── 3. KNOWLEDGE BASE RETRIEVAL ─────────────────────────────
  await runOne("KB", "niacinamide-acne", "does niacinamide help with acne", (r) => {
    if (r.sources.length === 0) return { passed: false, detail: "Expected KB sources, got 0" };
    if (!MEDICAL_DISCLAIMER.test(r.answer)) return { passed: false, detail: "Missing medical disclaimer" };
    const hasSkinInfo =
      /niacinamide|acne|anti.?inflammatory|sebum|oil/i.test(r.answer);
    if (!hasSkinInfo) return { passed: false, detail: "Answer does not mention niacinamide or acne — answer: " + r.answer.slice(0, 100) };

    const wordCount = r.answer.split(/\s+/).length;
    let detail = `Answered from KB (${r.sources.length} sources), disclaimer present`;
    if (wordCount > 150) detail += ` [WARN: ${wordCount} words, target ≤150]`;

    return { passed: true, detail };
  });

  await sleep(800);

  await runOne("KB", "keratosis-pilaris", "what causes keratosis pilaris", (r) => {
    if (r.sources.length === 0) return { passed: false, detail: "Expected KB sources, got 0" };
    if (!MEDICAL_DISCLAIMER.test(r.answer)) return { passed: false, detail: "Missing medical disclaimer" };
    const hasInfo =
      /keratosis|keratin|follicle|bump|chicken skin/i.test(r.answer);
    if (!hasInfo) return { passed: false, detail: "Answer does not mention keratosis pilaris — answer: " + r.answer.slice(0, 100) };

    const wordCount = r.answer.split(/\s+/).length;
    let detail = `Answered from KB (${r.sources.length} sources), disclaimer present`;
    if (wordCount > 150) detail += ` [WARN: ${wordCount} words, target ≤150]`;

    return { passed: true, detail };
  });

  await sleep(800);

  // ── 4. WEB FALLBACK ──────────────────────────────────────────
  await runOne("WEB_FALLBACK", "tiktok-trending", "what's trending on skincare TikTok in 2026", (r) => {
    if (!r.usedWebFallback) return { passed: false, detail: "Expected usedWebFallback=true, got false — KB should not know this" };
    const hasWebLive = r.sources.some((s) => s.sourceType === "web_live");
    if (!hasWebLive) return { passed: false, detail: "Expected at least one web_live source" };
    return { passed: true, detail: "Web fallback triggered, live web sources returned" };
  });

  await sleep(800);

  // ── 5. PRODUCT GROUNDING ─────────────────────────────────────
  await runOne("PRODUCT_GROUNDING", "moisturizer-ingredients", "what ingredients should I look for in a moisturizer for dry skin", (r) => {
    const sourceText = extractSourceText(r.sources);
    const hallucinatedBrands: string[] = [];

    for (const brand of KNOWN_BRANDS) {
      if (r.answer.includes(brand) && !sourceText.toLowerCase().includes(brand.toLowerCase())) {
        hallucinatedBrands.push(brand);
      }
    }

    if (hallucinatedBrands.length > 0) {
      return {
        passed: false,
        detail: `Hallucinated brands in answer but NOT in sources: ${hallucinatedBrands.join(", ")}`,
      };
    }

    if (!MEDICAL_DISCLAIMER.test(r.answer)) return { passed: false, detail: "Missing medical disclaimer" };

    const mentionsIngredients =
      /hyaluronic|ceramide|glycerin|niacinamide|shea|squalane|moisturiz/i.test(r.answer);
    if (!mentionsIngredients) return { passed: false, detail: "Answer does not mention moisturizer ingredients — answer: " + r.answer.slice(0, 100) };

    return {
      passed: true,
      detail: r.sources.some((s) => KNOWN_BRANDS.some((b) => extractSourceText([s]).toLowerCase().includes(b.toLowerCase())))
        ? "All mentioned brands also appear in sources (verified)"
        : "No brand names found in answer — grounded to ingredients only (pass)",
    };
  });

  await sleep(800);

  // ── 7. RESPONSE CONCISENESS ──────────────────────────────────
  // Already checked inline in KB tests — we flag wordCount warnings there.
  // Adding an explicit check here for the KB results.
  const kbNiacinamide = results.find((r) => r.name === "niacinamide-acne");
  const kbKP = results.find((r) => r.name === "keratosis-pilaris");
  for (const r of [kbNiacinamide, kbKP]) {
    if (!r) continue;
    const wordCount = r.detail.match(/(\d+) words/);
    if (wordCount) {
      // Already flagged inline — just note in summary
    }
  }

  // ── SUMMARY TABLE ────────────────────────────────────────────
  console.log("\n\n═══════════════════════════════════════════");
  console.log("SUMMARY");
  console.log("═══════════════════════════════════════════\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total: ${results.length}  |  Passed: ${passed}  |  Failed: ${failed}\n`);

  for (const r of results) {
    const icon = r.passed ? "✓" : "✗";
    console.log(`  ${icon} [${r.category}] ${r.name}`);
    console.log(`     Provider: ${r.provider ?? "N/A"}  |  WebFallback: ${r.usedWebFallback ?? "N/A"}  |  ${r.durationMs}ms`);
    console.log(`     ${r.passed ? "PASS" : "FAIL"}: ${r.detail}`);
  }

  if (failed > 0) {
    console.log(`\n── FAILURES ──`);
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  ✗ [${r.category}] ${r.name}: ${r.question}`);
      console.log(`     ${r.detail}`);
    }
  }

  // ── PROVIDER DISTRIBUTION ────────────────────────────────────
  console.log(`\n── PROVIDERS USED ──`);
  const providerCounts: Record<string, number> = {};
  for (const r of results) {
    const p = r.provider ?? "N/A";
    providerCounts[p] = (providerCounts[p] || 0) + 1;
  }
  for (const [p, c] of Object.entries(providerCounts)) {
    console.log(`  ${p}: ${c} queries`);
  }

  // ── CONCISENESS WARNINGS ─────────────────────────────────────
  const over150 = results.filter((r) => r.detail.includes("WARN:"));
  if (over150.length > 0) {
    console.log(`\n── CONCISENESS WARNINGS (>150 words) ──`);
    for (const r of over150) {
      console.log(`  ⚠ [${r.category}] ${r.name}: ${r.detail.match(/WARN:.*$/)?.[0]}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
