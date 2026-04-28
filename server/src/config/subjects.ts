/**
 * Subject configuration — single source of truth for role-based visibility.
 *
 * Bar students see ONLY bar-related subjects.
 * Law students (and admins) see ALL subjects.
 */

export const BAR_SUBJECTS = [
  "property_law",
  "civil_procedure",
  "criminal_procedure",
  "corporate_law",
  "legal_ethics",
] as const;

export const ALL_SUBJECTS = [
  // Bar subjects (visible to everyone)
  ...BAR_SUBJECTS,
  // Law-student-only subjects
  "constitutional_law",
  "evidence_law",
  "land_law",
  "family_law",
  "legal_drafting",
  "commercial_law",
  "public_international",
  "taxation",
  "law_of_contract",
  "law_of_torts",
  "equity_and_trusts",
  "criminal_law",
] as const;

export type SubjectId = (typeof ALL_SUBJECTS)[number];

/**
 * Returns the list of subjects visible to a given role.
 */
export function getVisibleSubjects(role: string): string[] {
  if (role === "bar_student") return [...BAR_SUBJECTS];
  return [...ALL_SUBJECTS]; // law_student and admin see everything
}

/**
 * Checks if a specific subject is allowed for a given role.
 */
export function isSubjectAllowed(subject: string, role: string): boolean {
  if (role !== "bar_student") return true; // law_student and admin can access all
  return (BAR_SUBJECTS as readonly string[]).includes(subject);
}
