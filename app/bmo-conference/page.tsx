import type { Metadata } from "next";
import { BmoConferenceClient } from "./BmoConferenceClient";

export const metadata: Metadata = {
  title: "BMO 2026 Real Assets Conference — Dexus",
  robots: { index: false, follow: false },
};

export default function BmoConferencePage() {
  return <BmoConferenceClient />;
}
