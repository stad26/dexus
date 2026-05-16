import type { Metadata } from "next";
import { NareitClient } from "./NareitClient";

export const metadata: Metadata = {
  title: "NAREIT REITweek 2026 — Dexus",
  robots: { index: false, follow: false },
};

export default function NareitPage() {
  return <NareitClient />;
}
