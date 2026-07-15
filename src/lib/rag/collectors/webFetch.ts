import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import * as cheerio from "cheerio";
import type { RawDoc } from "./types";

function cleanText(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractWithReadability(html: string, url: string): { title: string; text: string } | null {
  try {
    const doc = new JSDOM(html, { url }).window.document;
    const reader = new Readability(doc);
    const article = reader.parse();

    if (article && article.textContent && article.textContent.trim().length > 100) {
      return {
        title: article.title || "",
        text: cleanText(article.textContent),
      };
    }
  } catch (e) {
    console.warn(`[webFetch] Readability extraction failed for ${url}:`, e instanceof Error ? e.message : e);
  }

  return null;
}

function extractWithCheerio(html: string): { title: string; text: string } {
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim() || $("h1").first().text().trim();

  $(
    "script, style, noscript, nav, footer, header, aside, .sidebar, .nav, .menu, .ad, .ads, .banner, .footer, .header"
  ).remove();

  const body = $("body").text() || $("*").text();
  const text = cleanText(body);

  return { title, text };
}

/**
 * Collect content from a web URL by extracting readable text.
 * Tries @mozilla/readability first for article extraction,
 * falls back to cheerio for general HTML pages.
 *
 * @param url - The URL to fetch and parse
 * @param metadata - Optional metadata overrides (sourceType, title, etc.)
 * @returns A single RawDoc extracted from the page
 */
export async function collectFromWeb(
  url: string,
  metadata?: Record<string, any>
): Promise<RawDoc> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
    headers: {
      "User-Agent":
        "GlowGuide-RAG/1.0 (skincare knowledge bot; contact@glowguide.ai)",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  let extracted: { title: string; text: string } | null = extractWithReadability(html, url);

  if (!extracted) {
    extracted = extractWithCheerio(html);
  }

  if (!extracted.text || extracted.text.trim().length === 0) {
    throw new Error(`No readable content extracted from ${url}`);
  }

  const title = metadata?.title || extracted.title || url;
  const sourceType = metadata?.sourceType || "web";

  return {
    sourceType,
    sourceUrl: url,
    title,
    text: extracted.text,
    metadata: {
      ...metadata,
      source: metadata?.source || (() => { try { return new URL(url).hostname } catch { return url } })(),
    },
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Batch-collect from multiple URLs with concurrency control.
 * Failed URLs are silently skipped.
 *
 * @param urls - List of URLs to fetch
 * @param concurrency - Max concurrent fetches (default 5)
 * @returns Array of RawDoc (failed URLs are skipped)
 */
export async function collectFromWebBatch(
  urls: string[],
  concurrency: number = 5
): Promise<RawDoc[]> {
  const results: RawDoc[] = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      chunk.map((url) => collectFromWeb(url))
    );

    for (const r of settled) {
      if (r.status === "fulfilled") {
        results.push(r.value);
      } else {
        console.warn(`[webFetch] Failed URL skipped: ${(r as PromiseRejectedResult).reason}`);
      }
    }
  }

  return results;
}
