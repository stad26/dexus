export type ReitSector =
  | "industrial"
  | "retail"
  | "healthcare"
  | "residential"
  | "office"
  | "data-center"
  | "tower"
  | "self-storage"
  | "diversified"
  | "net-lease"
  | "hotel"
  | "timber"
  | "casino"
  | "mortgage"
  | "specialty"
  | "canadian";

export type ReleaseStatus = "CONF" | "EST";

export type ReviewerId = "DK" | "DL" | "SD";

export type ReitRow = {
  ticker: string;
  name: string;
  sector: ReitSector;
  releaseDate: string;
  callDate: string;
  exchange: string;
  status: ReleaseStatus;
  notes: string;
  /** Optional override; default Seeking Alpha earnings hub is used when omitted */
  saUrl?: string;
};

export type ReviewFlags = Record<ReviewerId, boolean>;

export const EMPTY_REVIEW: ReviewFlags = { DK: false, DL: false, SD: false };
