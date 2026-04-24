export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export async function braveSearch(query: string, apiKey: string): Promise<SearchResult[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!res.ok) throw new Error(`Brave Search error: ${res.status}`);

  const data = await res.json();
  const results: SearchResult[] = [];

  for (const item of data?.web?.results ?? []) {
    results.push({
      title: item.title ?? "",
      url: item.url ?? "",
      snippet: item.description ?? "",
    });
  }

  return results.slice(0, 5);
}
