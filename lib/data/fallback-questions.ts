import type { Question } from "@/lib/store/game-store";

const QUESTIONS: Question[] = [
  // Law of Contract
  { id: "fq-001", subject: "law_of_contract", topic: "Offer & Acceptance", difficulty: "medium",
    question: "In Carlill v Carbolic Smoke Ball Co (1893), the court held the advertisement was a valid offer because:",
    options: { A: "It was addressed to the whole world", B: "It contained a condition precedent", C: "Money was deposited showing genuine intent", D: "All of the above" },
    correct_option: "D", explanation: "All three factors combined: the offer was addressed to the world, contained a condition precedent (using the ball), and the £1,000 deposited showed genuine intent." },

  { id: "fq-002", subject: "law_of_contract", topic: "Consideration", difficulty: "medium",
    question: "Promissory estoppel as established in Central London Property Trust v High Trees House [1947] prevents a promisor from:",
    options: { A: "Making a new contract", B: "Going back on a clear promise the promisee relied on", C: "Claiming damages for breach", D: "Seeking specific performance" },
    correct_option: "B", explanation: "Promissory estoppel prevents a promisor from going back on a clear and unequivocal promise where the promisee has relied on it to their detriment." },

  { id: "fq-003", subject: "law_of_contract", topic: "Capacity", difficulty: "easy",
    question: "A contract made by a minor is generally:",
    options: { A: "Void ab initio", B: "Voidable at the minor's option", C: "Fully enforceable", D: "Unenforceable by either party" },
    correct_option: "B", explanation: "Contracts made by minors are voidable — the minor can repudiate the contract but the other party cannot." },

  { id: "fq-004", subject: "law_of_contract", topic: "Misrepresentation", difficulty: "hard",
    question: "Which type of misrepresentation gives rise to rescission AND damages under the Misrepresentation Act 1967?",
    options: { A: "Fraudulent misrepresentation only", B: "Negligent misrepresentation only", C: "Innocent misrepresentation only", D: "Both fraudulent and negligent misrepresentation" },
    correct_option: "D", explanation: "Both fraudulent (Derry v Peek) and negligent misrepresentation give rise to both rescission and damages. Innocent misrepresentation gives only rescission (or damages in lieu at court's discretion)." },

  { id: "fq-005", subject: "law_of_contract", topic: "Frustration", difficulty: "medium",
    question: "The doctrine of frustration was first established in:",
    options: { A: "Taylor v Caldwell (1863)", B: "Krell v Henry (1903)", C: "Davis Contractors v Fareham UDC (1956)", D: "Fibrosa SA v Fairbairn (1943)" },
    correct_option: "A", explanation: "Taylor v Caldwell (1863) established the doctrine of frustration when a music hall burned down before a concert series, relieving both parties of their obligations." },

  // Law of Torts
  { id: "fq-006", subject: "law_of_torts", topic: "Duty of Care", difficulty: "easy",
    question: "Which case established the 'neighbour principle' and laid the foundation for the modern law of negligence?",
    options: { A: "Caparo Industries v Dickman (1990)", B: "Donoghue v Stevenson (1932)", C: "Bolton v Stone (1951)", D: "Anns v Merton (1978)" },
    correct_option: "B", explanation: "Donoghue v Stevenson [1932] — Lord Atkin's neighbour principle: you owe a duty of care to those closely and directly affected by your acts." },

  { id: "fq-007", subject: "law_of_torts", topic: "Duty of Care", difficulty: "medium",
    question: "The three-stage Caparo test for establishing a duty of care requires:",
    options: { A: "Foreseeability, proximity, and fairness/justice", B: "Proximity, causation, and remoteness", C: "Foreseeability, intention, and proximity", D: "Reliance, assumption, and damage" },
    correct_option: "A", explanation: "Caparo Industries v Dickman [1990] set out the three-stage test: (1) damage was foreseeable, (2) proximity of relationship, (3) it is fair, just and reasonable to impose a duty." },

  { id: "fq-008", subject: "law_of_torts", topic: "Occupiers' Liability", difficulty: "medium",
    question: "Under the Occupiers' Liability Act 1957, the duty owed to lawful visitors is:",
    options: { A: "A duty of care in all circumstances", B: "A common duty of care to take reasonable care", C: "Strict liability for all injuries", D: "No duty unless negligence is proven" },
    correct_option: "B", explanation: "The Occupiers' Liability Act 1957 imposes a 'common duty of care' on occupiers towards all lawful visitors: to take such care as is reasonable to see the visitor will be reasonably safe." },

  { id: "fq-009", subject: "law_of_torts", topic: "Defamation", difficulty: "hard",
    question: "Which of the following is NOT a defence to defamation?",
    options: { A: "Truth (justification)", B: "Honest opinion (fair comment)", C: "Privilege", D: "Ignorance of publication" },
    correct_option: "D", explanation: "Ignorance of publication is not a recognised defence to defamation. The established defences are: truth, honest opinion, privilege (absolute/qualified), and publication on a matter of public interest." },

  { id: "fq-010", subject: "law_of_torts", topic: "Vicarious Liability", difficulty: "medium",
    question: "An employer is vicariously liable for an employee's tort when:",
    options: { A: "The tort occurs during working hours only", B: "The tort is committed in the course of employment", C: "The employer authorised the specific act", D: "The employee is a permanent staff member" },
    correct_option: "B", explanation: "Vicarious liability attaches when the tort is committed 'in the course of employment' — a wider test that includes authorised acts done in an unauthorised manner (Limpus v London General Omnibus Co)." },

  // Criminal Law
  { id: "fq-011", subject: "criminal_law", topic: "Elements of Crime", difficulty: "easy",
    question: "The Latin maxim 'actus non facit reum nisi mens sit rea' means:",
    options: { A: "An act is not criminal unless done with a guilty mind", B: "The act alone is sufficient for liability", C: "Ignorance of the law is no defence", D: "A person is innocent until proven guilty" },
    correct_option: "A", explanation: "The maxim means 'an act does not make a person guilty unless their mind is also guilty' — establishing that both actus reus and mens rea must be proven for most crimes." },

  { id: "fq-012", subject: "criminal_law", topic: "Murder", difficulty: "medium",
    question: "The mens rea for murder in Nigeria (and under common law) requires:",
    options: { A: "Intention to kill only", B: "Intention to kill or cause grievous bodily harm", C: "Recklessness as to death or serious injury", D: "Negligence resulting in death" },
    correct_option: "B", explanation: "The mens rea for murder is malice aforethought — the intention to kill or cause grievous bodily harm (GBH). Recklessness alone is insufficient for murder (R v Moloney)." },

  { id: "fq-013", subject: "criminal_law", topic: "Defences", difficulty: "medium",
    question: "In a self-defence claim, the force used must be:",
    options: { A: "Exactly proportional to the threat", B: "Reasonable in the circumstances as the defendant believed them to be", C: "Minimal and only defensive", D: "Pre-authorised by law enforcement" },
    correct_option: "B", explanation: "Self-defence requires the force used to be reasonable in the circumstances as the defendant honestly (not necessarily reasonably) believed them to be — R v Williams (Gladstone) [1984]." },

  { id: "fq-014", subject: "criminal_law", topic: "Theft", difficulty: "easy",
    question: "Under Section 383 of the Nigerian Criminal Code, theft requires that the taking be:",
    options: { A: "Permanent and without consent", B: "Fraudulent, without claim of right, with intent to permanently deprive", C: "Secretive and at night", D: "By force or threat of force" },
    correct_option: "B", explanation: "Theft under the Criminal Code requires: (1) fraudulent taking, (2) without a claim of right, (3) with intent to permanently deprive the owner." },

  // Constitutional Law
  { id: "fq-015", subject: "constitutional_law", topic: "Fundamental Rights", difficulty: "medium",
    question: "Under the 1999 CFRN (as amended), which chapter contains the Fundamental Rights provisions?",
    options: { A: "Chapter I", B: "Chapter II", C: "Chapter IV", D: "Chapter VI" },
    correct_option: "C", explanation: "Chapter IV of the 1999 Constitution (Sections 33–46) contains the Fundamental Rights provisions, including rights to life, dignity, personal liberty, fair hearing, and privacy." },

  { id: "fq-016", subject: "constitutional_law", topic: "Legislature", difficulty: "hard",
    question: "The minimum age to contest for a seat in the Nigerian House of Representatives is:",
    options: { A: "21 years", B: "25 years", C: "30 years", D: "35 years" },
    correct_option: "C", explanation: "Section 65(2)(a) CFRN 1999 requires that a candidate for the House of Representatives must be at least 30 years of age." },

  { id: "fq-017", subject: "constitutional_law", topic: "Judiciary", difficulty: "medium",
    question: "The Chief Justice of Nigeria is appointed by:",
    options: { A: "The President alone", B: "The National Judicial Council", C: "The President on the recommendation of the National Judicial Council, subject to Senate confirmation", D: "The Senate by simple majority" },
    correct_option: "C", explanation: "Section 231(1) CFRN: The CJN is appointed by the President on the recommendation of the National Judicial Council, subject to confirmation by the Senate." },

  // Equity & Trusts
  { id: "fq-018", subject: "equity_and_trusts", topic: "Maxims of Equity", difficulty: "easy",
    question: "The equitable maxim 'He who comes to equity must come with clean hands' means:",
    options: { A: "Equitable relief is available to all claimants", B: "A claimant must not have acted unconscionably in relation to the matter", C: "The claimant must be financially sound", D: "The defendant must have committed a legal wrong" },
    correct_option: "B", explanation: "The 'clean hands' maxim means a claimant seeking equitable relief must not themselves have acted unconscionably or inequitably in relation to the subject matter of the claim." },

  { id: "fq-019", subject: "equity_and_trusts", topic: "Express Trusts", difficulty: "medium",
    question: "The three certainties required to create a valid express trust are:",
    options: { A: "Certainty of intention, subject matter, and objects", B: "Certainty of words, parties, and consideration", C: "Certainty of intention, consideration, and formality", D: "Certainty of offer, acceptance, and objects" },
    correct_option: "A", explanation: "Knight v Knight (1840) established the three certainties: (1) certainty of intention to create a trust, (2) certainty of subject matter (trust property), (3) certainty of objects (beneficiaries)." },

  // Family Law
  { id: "fq-020", subject: "family_law", topic: "Marriage", difficulty: "medium",
    question: "Under the Matrimonial Causes Act, the primary ground for divorce in Nigeria is:",
    options: { A: "Adultery", B: "Irretrievable breakdown of marriage", C: "Separation for 2 years", D: "Cruelty" },
    correct_option: "B", explanation: "Section 15(1) of the Matrimonial Causes Act provides that the sole ground for divorce is that the marriage has broken down irretrievably. The other options are merely facts used to prove irretrievable breakdown." },

  // Civil Procedure
  { id: "fq-021", subject: "civil_procedure", topic: "Jurisdiction", difficulty: "medium",
    question: "The High Court of a State in Nigeria has jurisdiction over civil matters where the subject matter value exceeds:",
    options: { A: "₦500,000", B: "₦1,000,000", C: "There is no monetary limit — jurisdiction depends on the nature of the claim", D: "₦5,000,000" },
    correct_option: "C", explanation: "State High Courts have unlimited civil jurisdiction — there is no monetary threshold. Jurisdiction is determined by the nature and subject matter of the claim, not the amount." },

  { id: "fq-022", subject: "civil_procedure", topic: "Pleadings", difficulty: "hard",
    question: "Under the rules of pleading, a party must plead:",
    options: { A: "Facts, law, and evidence", B: "Material facts only, not evidence or law", C: "Evidence and conclusions of law", D: "All facts within the party's knowledge" },
    correct_option: "B", explanation: "The fundamental rule of pleading is that parties plead material facts only — not evidence (which is proved at trial) and not law (which the court applies). Pleadings must be concise statements of fact." },

  // Evidence
  { id: "fq-023", subject: "evidence_law", topic: "Hearsay", difficulty: "medium",
    question: "The rule against hearsay provides that an out-of-court statement is inadmissible when tendered to prove:",
    options: { A: "The maker's state of mind", B: "The truth of its contents", C: "The existence of the statement", D: "The credibility of a witness" },
    correct_option: "B", explanation: "Hearsay is an out-of-court statement tendered to prove the truth of its contents. If tendered for any other purpose (e.g., to show the statement was made), it is not hearsay." },

  { id: "fq-024", subject: "evidence_law", topic: "Burden of Proof", difficulty: "easy",
    question: "In civil proceedings, the standard of proof is:",
    options: { A: "Beyond reasonable doubt", B: "Balance of probabilities", C: "Prima facie evidence", D: "Absolute certainty" },
    correct_option: "B", explanation: "In civil cases, the standard of proof is the balance of probabilities — the claimant must show their case is more likely true than not (>50%). Criminal cases require proof beyond reasonable doubt." },

  // Property Law
  { id: "fq-025", subject: "property_law", topic: "Land Tenure", difficulty: "medium",
    question: "Under the Land Use Act 1978, all land in each State is vested in:",
    options: { A: "The Federal Government", B: "The Governor of the State in trust for all Nigerians", C: "The Local Government", D: "Private landowners in fee simple" },
    correct_option: "B", explanation: "Section 1 of the Land Use Act 1978 vests all land in each State in the Governor of that State, to be held in trust and administered for the use and common benefit of all Nigerians." },
];

const TRACK_IDS = new Set(["law_school_track", "undergraduate_track"]);

export function getFallbackQuestions(
  subject: string,
  difficulty: string,
  count: number
): Question[] {
  const isGeneralMode = TRACK_IDS.has(subject);

  // Specific subject: ONLY return questions tagged for that exact subject.
  // Never cross-contaminate — an empty array signals "no questions for this subject".
  if (!isGeneralMode) {
    let pool = QUESTIONS.filter((q) => q.subject === subject && q.difficulty === difficulty);
    if (pool.length < count) {
      pool = [...pool, ...QUESTIONS.filter((q) => q.subject === subject && !pool.includes(q))];
    }
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  // General (track) mode: pull from all subjects, difficulty first, then any
  let pool = QUESTIONS.filter((q) => q.difficulty === difficulty);
  if (pool.length < count) {
    pool = [...pool, ...QUESTIONS.filter((q) => !pool.includes(q))];
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
