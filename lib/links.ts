import type { ReitRow } from "@/lib/types";

/** Default Seeking Alpha earnings hub for the symbol (US-centric; TSX symbols may vary). */
export function defaultSeekingAlphaUrl(ticker: string): string {
  const slug = ticker.replace(/\./g, "-");
  return `https://seekingalpha.com/symbol/${encodeURIComponent(slug)}/earnings`;
}

export function seekingAlphaUrl(row: ReitRow): string {
  return row.saUrl ?? defaultSeekingAlphaUrl(row.ticker);
}
