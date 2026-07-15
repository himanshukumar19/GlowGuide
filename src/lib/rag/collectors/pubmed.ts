import type { RawDoc } from "./types";

const ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";

interface ParsedArticle {
  pmid: string;
  title: string;
  abstract: string;
  year: string;
  authors: string;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function parsePubMedXML(xml: string): ParsedArticle[] {
  const articles: ParsedArticle[] = [];

  const articleBlocks = xml.split(/<PubmedArticle[^>]*>/);

  for (let i = 1; i < articleBlocks.length; i++) {
    const block = articleBlocks[i];

    const pmidMatch = block.match(/<PMID[^>]*>([^<]*)<\/PMID>/);
    const pmid = pmidMatch?.[1]?.trim() ?? "";
    if (!pmid) continue;

    const titleMatch = block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/);
    const title = decodeXmlEntities(titleMatch?.[1]?.trim() ?? "");

    const abstractParts: string[] = [];
    for (const m of block.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)) {
      abstractParts.push(decodeXmlEntities(m[1].trim()));
    }
    const abstract = abstractParts.join(" ");

    const yearMatch = block.match(/<Year>(\d{4})<\/Year>/);
    const year = yearMatch?.[1] ?? "";

    const authors: string[] = [];
    for (const authorMatch of block.matchAll(/<Author[^>]*>([\s\S]*?)<\/Author>/g)) {
      const authorXml = authorMatch[1];
      const lastMatch = authorXml.match(/<LastName>([^<]*)<\/LastName>/);
      const foreMatch = authorXml.match(/<ForeName>([^<]*)<\/ForeName>/);
      if (lastMatch) {
        const lastName = lastMatch[1].trim();
        const foreName = foreMatch?.[1]?.trim() ?? "";
        authors.push(foreName ? `${lastName} ${foreName}` : lastName);
      }
    }

    articles.push({
      pmid,
      title,
      abstract,
      year,
      authors: authors.join("; "),
    });
  }

  return articles;
}

/**
 * Collect documents from PubMed via NCBI E-utilities API.
 *
 * @param query - Search term (e.g. "retinoid dermatitis")
 * @param options - { retmax: max results (default 20), minYear: filter by publication year }
 * @returns Array of RawDoc from PubMed
 */
export async function collectFromPubMed(
  query: string,
  options?: { retmax?: number; minYear?: number }
): Promise<RawDoc[]> {
  const retmax = options?.retmax ?? 20;
  const minYear = options?.minYear;
  const apiKey = process.env.NCBI_API_KEY;

  const esearchParams = new URLSearchParams({
    db: "pubmed",
    term: query,
    retmax: String(retmax),
    retmode: "json",
    sort: "relevance",
  });
  if (apiKey) esearchParams.set("api_key", apiKey);

  const esearchRes = await fetch(`${ESEARCH_URL}?${esearchParams.toString()}`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!esearchRes.ok) {
    throw new Error(`PubMed esearch failed: ${esearchRes.status} ${esearchRes.statusText}`);
  }
  const esearchData = await esearchRes.json();
  const pmids: string[] = esearchData.esearchresult?.idlist ?? [];

  if (pmids.length === 0) return [];

  const efetchParams = new URLSearchParams({
    db: "pubmed",
    id: pmids.join(","),
    rettype: "abstract",
    retmode: "xml",
  });
  if (apiKey) efetchParams.set("api_key", apiKey);

  const efetchRes = await fetch(`${EFETCH_URL}?${efetchParams.toString()}`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!efetchRes.ok) {
    throw new Error(`PubMed efetch failed: ${efetchRes.status} ${efetchRes.statusText}`);
  }
  const xml = await efetchRes.text();

  const articles = parsePubMedXML(xml);

  return articles
    .filter((a) => a.abstract && a.abstract.trim().length > 0)
    .filter((a) => !minYear || (a.year && parseInt(a.year, 10) >= minYear))
    .map(
      (a): RawDoc => ({
        sourceType: "pubmed",
        sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,
        title: a.title,
        text: a.abstract,
        metadata: {
          authors: a.authors,
          year: a.year,
          source: "PubMed",
          pmid: a.pmid,
        },
        retrievedAt: new Date().toISOString(),
      })
    );
}
