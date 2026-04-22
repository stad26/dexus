import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ReitReviewRow = {
  ticker: string;
  reviewer: "DK" | "DL" | "SD";
  reviewed: boolean;
  updated_at?: string;
};

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!browserClient) browserClient = createClient(url, key);
  return browserClient;
}

export function reviewRowsToMap(rows: ReitReviewRow[]) {
  const map: Record<string, { DK: boolean; DL: boolean; SD: boolean }> = {};
  for (const r of rows) {
    if (!map[r.ticker]) map[r.ticker] = { DK: false, DL: false, SD: false };
    map[r.ticker][r.reviewer] = r.reviewed;
  }
  return map;
}
