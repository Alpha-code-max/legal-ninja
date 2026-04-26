export const TRACKS = {
  law_school_track: {
    id: "law_school_track",
    name: "Law School Track",
    subjects: [
      { id: "civil_procedure", name: "Civil Procedure" },
      { id: "criminal_procedure", name: "Criminal Procedure" },
      { id: "property_law", name: "Property Law" },
      { id: "corporate_law", name: "Corporate Law" },
      { id: "legal_ethics", name: "Legal Ethics" },
      { id: "constitutional_law", name: "Constitutional Law" },
      { id: "evidence_law", name: "Evidence Law" },
    ],
  },
  undergraduate_track: {
    id: "undergraduate_track",
    name: "Undergraduate Track",
    subjects: [
      { id: "law_of_contract", name: "Law of Contract" },
      { id: "law_of_torts", name: "Law of Torts" },
      { id: "criminal_law", name: "Criminal Law" },
      { id: "constitutional_law", name: "Constitutional Law" },
      { id: "equity_and_trusts", name: "Equity & Trusts" },
      { id: "family_law", name: "Family Law" },
    ],
  },
} as const;

export type TrackId = keyof typeof TRACKS;
export type Track = (typeof TRACKS)[TrackId];
export type Subject = Track["subjects"][number];
