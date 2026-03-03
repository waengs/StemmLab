export function normalizeSearch(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearch(text: string, query: string): boolean {
  const normalized = normalizeSearch(query);
  if (!normalized) return true;
  return text.toLowerCase().includes(normalized);
}
