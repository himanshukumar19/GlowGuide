import { Document } from "@langchain/core/documents";

const API_URL = "https://api.semanticscholar.org/graph/v1/paper/search";

async function fetchWithRetry(
  url: string,
  baseInit: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastStatus = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const init: RequestInit = {
      ...baseInit,
      signal: AbortSignal.timeout(30_000),
    };

    const res = await fetch(url, init);

    if (res.ok) return res;

    lastStatus = res.status;

    if (res.status === 429 && attempt < maxRetries) {
      const wait = 10_000 * Math.pow(2, attempt);
      console.warn(
        `[semantic_scholar] Rate limited (429), waiting ${wait / 1000}s before retry ${attempt + 1}/${maxRetries}...`
      );
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    if (res.status !== 429) break;
  }

  throw new Error(
    `Semantic Scholar API failed after ${maxRetries + 1} attempts: status ${lastStatus}`
  );
}

function generateDocId(title: string, doi?: string): string {
  if (doi) {
    const slug = doi.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    return `s2-${slug}`;
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash = hash | 0;
  }

  return `s2-${slug}-${Math.abs(hash).toString(36).slice(0, 8)}`;
}

/**
 * Collect documents from Semantic Scholar API.
 *
 * @param query - Search term (e.g. "retinol skin aging")
 * @param options - { limit: max results (default 20), minYear: filter by publication year }
 * @returns Array of LangChain Document objects
 */
export async function collectFromSemanticScholar(
  query: string,
  options?: { limit?: number; minYear?: number }
): Promise<Document[]> {
  const limit = options?.limit ?? 20;
  const minYear = options?.minYear;
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;

  const params = new URLSearchParams({
    query,
    limit: String(limit),
    fields: "title,abstract,year,authors,externalIds,url,venue",
  });

  const headers: Record<string, string> = {};
  if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetchWithRetry(`${API_URL}?${params.toString()}`, {
    headers,
  });

  const data = await res.json();
  const papers: any[] = data?.data ?? [];

  return papers
    .filter((p: any) => p.abstract && p.abstract.trim().length > 0)
    .filter(
      (p: any) => !minYear || (p.year && p.year >= minYear)
    )
    .map(
      (p: any): Document => {
        const authorNames: string[] = (p.authors ?? []).map(
          (a: any) => a.name
        );

        let sourceUrl: string;
        if (p.url) {
          sourceUrl = p.url;
        } else if (p.externalIds?.DOI) {
          sourceUrl = `https://doi.org/${p.externalIds.DOI}`;
        } else {
          sourceUrl = "N/A";
        }

        const doi = p.externalIds?.DOI;
        const title = p.title ?? "";
        const docId = generateDocId(title, doi);

        return new Document({
          pageContent: p.abstract ?? "",
          metadata: {
            docId,
            sourceUrl,
            title,
            sourceType: "peer_reviewed",
            source: "Semantic Scholar",
            authors: authorNames.join("; "),
            year: p.year?.toString() ?? "",
            venue: p.venue ?? "",
            retrievedAt: new Date().toISOString(),
          },
        });
      }
    );
}
