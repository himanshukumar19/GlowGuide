import { TavilySearch } from "@langchain/tavily";

type WebSearchResult = {
  title: string;
  url: string;
  content: string;
  rawContent?: string;
};

/**
 * Search the web using Tavily Search API.
 *
 * Tavily is configured to return full raw markdown content for each result
 * when available, reducing the need for a separate scrape step.
 *
 * @param query - Search query string
 * @param maxResults - Maximum number of results to return (default 3)
 * @returns Array of {title, url, content, rawContent} results
 */
export async function searchWeb(
  query: string,
  maxResults: number = 3
): Promise<WebSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[webSearch] TAVILY_API_KEY not set — skipping web search");
    return [];
  }

  const tool = new TavilySearch({
    tavilyApiKey: apiKey,
    maxResults,
    includeRawContent: "markdown",
  });

  try {
    const response = await tool.invoke({ query });

    if ("error" in response) {
      console.warn("[webSearch] Tavily error:", (response as any).error);
      return [];
    }

    const results = (response as any).results ?? [];
    return results.map((r: any) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: r.content ?? "",
      rawContent: r.raw_content ?? "",
    }));
  } catch (e) {
    console.warn("[webSearch] Search failed:", e instanceof Error ? e.message : e);
    return [];
  }
}
