import "dotenv/config";
import mongoose from "mongoose";
import { Question } from "./src/models/Question";

const FALLBACK_QUESTIONS = [
  // Law of Contract
  { subject: "law_of_contract", topic: "Offer & Acceptance", difficulty: "medium", track: "undergraduate_track",
    question: "In Carlill v Carbolic Smoke Ball Co (1893), the court held the advertisement was a valid offer because:",
    options: { A: "It was addressed to the whole world", B: "It contained a condition precedent", C: "Money was deposited showing genuine intent", D: "All of the above" },
    correct_option: "D", explanation: "All three factors combined: the offer was addressed to the world, contained a condition precedent (using the ball), and the £1,000 deposited showed genuine intent." },

  { subject: "law_of_contract", topic: "Consideration", difficulty: "medium", track: "undergraduate_track",
    question: "Promissory estoppel as established in Central London Property Trust v High Trees House [1947] prevents a promisor from:",
    options: { A: "Making a new contract", B: "Going back on a clear promise the promisee relied on", C: "Claiming damages for breach", D: "Seeking specific performance" },
    correct_option: "B", explanation: "Promissory estoppel prevents a promisor from going back on a clear and unequivocal promise where the promisee has relied on it to their detriment." },

  { subject: "law_of_contract", topic: "Capacity", difficulty: "easy", track: "undergraduate_track",
    question: "A contract made by a minor is generally:",
    options: { A: "Void ab initio", B: "Voidable at the minor's option", C: "Fully enforceable", D: "Unenforceable by either party" },
    correct_option: "B", explanation: "Contracts made by minors are voidable — the minor can repudiate the contract but the other party cannot." },

  // Law of Torts
  { subject: "law_of_torts", topic: "Duty of Care", difficulty: "easy", track: "undergraduate_track",
    question: "Which case established the 'neighbour principle' and laid the foundation for the modern law of negligence?",
    options: { A: "Caparo Industries v Dickman (1990)", B: "Donoghue v Stevenson (1932)", C: "Bolton v Stone (1951)", D: "Anns v Merton (1978)" },
    correct_option: "B", explanation: "Donoghue v Stevenson [1932] — Lord Atkin's neighbour principle: you owe a duty of care to those closely and directly affected by your acts." },

  // Criminal Law
  { subject: "criminal_law", topic: "Elements of Crime", difficulty: "easy", track: "undergraduate_track",
    question: "The Latin maxim 'actus non facit reum nisi mens sit rea' means:",
    options: { A: "An act is not criminal unless done with a guilty mind", B: "The act alone is sufficient for liability", C: "Ignorance of the law is no defence", D: "A person is innocent until proven guilty" },
    correct_option: "A", explanation: "The maxim means 'an act does not make a person guilty unless their mind is also guilty' — establishing that both actus reus and mens rea must be proven for most crimes." },

  // Constitutional Law
  { subject: "constitutional_law", topic: "Fundamental Rights", difficulty: "medium", track: "undergraduate_track",
    question: "Under the 1999 CFRN (as amended), which chapter contains the Fundamental Rights provisions?",
    options: { A: "Chapter I", B: "Chapter II", C: "Chapter IV", D: "Chapter VI" },
    correct_option: "C", explanation: "Chapter IV of the 1999 Constitution (Sections 33–46) contains the Fundamental Rights provisions, including rights to life, dignity, personal liberty, fair hearing, and privacy." },

  // Evidence
  { subject: "evidence_law", topic: "Hearsay", difficulty: "medium", track: "law_school_track",
    question: "The rule against hearsay provides that an out-of-court statement is inadmissible when tendered to prove:",
    options: { A: "The maker's state of mind", B: "The truth of its contents", C: "The existence of the statement", D: "The credibility of a witness" },
    correct_option: "B", explanation: "Hearsay is an out-of-court statement tendered to prove the truth of its contents. If tendered for any other purpose (e.g., to show the statement was made), it is not hearsay." },

  // Property Law
  { subject: "property_law", topic: "Land Tenure", difficulty: "medium", track: "law_school_track",
    question: "Under the Land Use Act 1978, all land in each State is vested in:",
    options: { A: "The Federal Government", B: "The Governor of the State in trust for all Nigerians", C: "The Local Government", D: "Private landowners in fee simple" },
    correct_option: "B", explanation: "Section 1 of the Land Use Act 1978 vests all land in each State in the Governor of that State, to be held in trust and administered for the use and common benefit of all Nigerians." },
];

// Essay questions for exam simulation
const ESSAY_QUESTIONS = [
  { subject: "law_of_contract", topic: "Formation of Contract", difficulty: "medium", track: "undergraduate_track", type: "essay" as const,
    question: "Discuss the conditions necessary for a valid acceptance in the formation of contract. Illustrate your answer with relevant case law.",
    model_answer: "A valid acceptance must be: (1) Unequivocal and unconditional (Carlill v Carbolic); (2) Communicated to the offeror (Entores v Miles); (3) In response to the offer; (4) Made while the offer is still open. The acceptance must mirror the offer exactly. A counter-offer destroys the original offer. Acceptance by conduct is valid if there is clear evidence of intention to accept.",
    rubric: "Award marks for: defining acceptance (5), listing essential conditions (15), case references (10), explanation of each condition (20), practical application (10). Total: 60 marks. Pass: 30+" },

  { subject: "civil_procedure", topic: "Pleadings", difficulty: "hard", track: "law_school_track", type: "essay" as const,
    question: "Explain the significance of the statement of claim and statement of defence in civil litigation. What are the consequences of failing to plead material facts adequately?",
    model_answer: "The statement of claim and defence are foundational pleadings that define the issues in dispute. The statement of claim must disclose all material facts (not law or evidence) that constitute the cause of action. The statement of defence must respond to all allegations - admitting, denying, or putting the plaintiff to proof. Failure to plead material facts can lead to: (1) Default judgment; (2) Striking out; (3) Waiver of the issue; (4) Estoppel from raising unpleaded defences. Proper pleading ensures fair notice, prevents ambush, and narrows the issues for trial.",
    rubric: "Statement of claim definition (10), material facts requirement (10), statement of defence role (10), consequences of failure (20), case principles (15). Total: 65 marks. Pass: 33+" },

  { subject: "law_of_torts", topic: "Negligence", difficulty: "hard", track: "law_school_track", type: "essay" as const,
    question: "A builder negligently constructed a wall in a residential area. It collapsed and damaged a car parked nearby. The car owner was not injured. Discuss whether the car owner can sue the builder for negligence, considering the principles in Anns v Merton and Caparo Industries v Dickman.",
    model_answer: "The car owner must establish: (1) Duty of care - using Caparo test: foreseeability (clearly foreseeable), proximity (neighboring car), and policy (no restrictions). (2) Breach - the negligent construction breached the duty. (3) Causation - but breaking the chain of causation is impossible. Damage is purely economic (property damage is not purely economic). Applying Anns, even after Caparo's restrictions, a builder owes duty to prevent physical damage to neighboring property. The car owner should succeed.",
    rubric: "Duty of care analysis (20), breach discussion (10), causation (10), distinction between economic and property damage (15), case application (15). Total: 70 marks. Pass: 35+" },

  { subject: "criminal_law", topic: "Actus Reus and Mens Rea", difficulty: "medium", track: "undergraduate_track", type: "essay" as const,
    question: "Explain the doctrine of mens rea in criminal law. How does it differ from strict liability offences? Support your answer with examples.",
    model_answer: "Mens rea (guilty mind) is the mental element required for most crimes. It includes intention, recklessness, or negligence. Intention can be direct or oblique. Recklessness means foreseeing the risk but proceeding anyway. Strict liability offences require no mens rea (e.g., regulatory offences like traffic violations). The distinction matters because mens rea offences are more serious and allow defenses. For example, murder requires intention; dangerous driving requires recklessness; selling contaminated food is strict liability.",
    rubric: "Definition of mens rea (10), types of mens rea (20), definition of strict liability (10), distinction explained (15), examples given (15). Total: 70 marks. Pass: 35+" },

  { subject: "constitutional_law", topic: "Separation of Powers", difficulty: "hard", track: "law_school_track", type: "essay" as const,
    question: "Critically examine the principle of separation of powers under the 1999 Nigerian Constitution. How effectively has this principle been implemented in practice?",
    model_answer: "Separation of powers divides government into three branches: Executive, Legislative, and Judicial. Under the 1999 CFRN, each has distinct powers but they also check and balance each other. The Executive cannot pass laws (legislative power), the Legislature cannot enforce laws (executive power), and the Judiciary is independent. However, in practice: (1) The Executive often dominates through the party system; (2) Judicial independence has faced challenges during military rule; (3) Executive abuse of power occurs. Recent reforms and court activism have strengthened the principle.",
    rubric: "Explanation of separation of powers (15), CFRN provisions (15), implementation analysis (20), practical challenges (20), critical evaluation (10). Total: 80 marks. Pass: 40+" },

  { subject: "criminal_procedure", topic: "Arrest and Detention", difficulty: "medium", track: "law_school_track", type: "essay" as const,
    question: "Discuss the legal requirements for a lawful arrest under the Administration of Criminal Justice Act (ACJA). What remedies are available to a person unlawfully arrested?",
    model_answer: "A lawful arrest requires: (1) Authority - a warrant or lawful without warrant for indictable offence; (2) Reasonable suspicion of guilt; (3) Proper identification of arresting officer; (4) Communication of arrest and reasons; (5) Proportionality. Under ACJA 2015, detention must not exceed 24-48 hours without a court order. Remedies for unlawful arrest include: habeas corpus to obtain release, damages for false imprisonment, exclusion of evidence obtained unlawfully, and disciplinary action against officers.",
    rubric: "ACJA requirements (15), arrest procedure (15), detention limits (10), remedies explained (15), case application (10). Total: 65 marks. Pass: 33+" },

  { subject: "property_law", topic: "Ownership and Possession", difficulty: "medium", track: "law_school_track", type: "essay" as const,
    question: "Distinguish between ownership and possession of land under Nigerian law. Discuss how adverse possession operates and its requirements for acquiring title.",
    model_answer: "Ownership is the legal right to possess and use property; possession is actual physical control. Under the Land Use Act 1978, the State owns all land; individuals have customary rights and statutory leases. Adverse possession allows occupation to ripen into title after 12 years (registered land) or by statutory declaration. Requirements: (1) Actual occupation; (2) Exclusive possession; (3) Open and notorious; (4) Continuous for required period; (5) Against the true owner. This applies to unregistered customary land.",
    rubric: "Ownership definition (10), possession definition (10), statutory framework (15), adverse possession requirements (20), practical application (10). Total: 65 marks. Pass: 33+" },

  { subject: "evidence_law", topic: "Burden and Standard of Proof", difficulty: "medium", track: "law_school_track", type: "essay" as const,
    question: "Explain the burden of proof and standard of proof in civil and criminal cases. How do these differ and why?",
    model_answer: "Burden of proof determines who must prove their case; standard of proof determines the degree of certainty required. In criminal cases: burden is on prosecution (except defenses like insanity), standard is 'beyond reasonable doubt' (very high). In civil cases: burden usually on plaintiff, standard is 'balance of probabilities' (more likely than not - 50%+). The difference exists because criminal conviction can result in imprisonment; civil liability is merely pecuniary. Some exceptions exist (e.g., reverse burden in some regulatory offences).",
    rubric: "Burden definition (10), standard definition (10), civil case explanation (15), criminal case explanation (15), reason for difference (10). Total: 60 marks. Pass: 30+" },

  { subject: "law_of_torts", topic: "Vicarious Liability", difficulty: "hard", track: "law_school_track", type: "essay" as const,
    question: "Explain the doctrine of vicarious liability. When is an employer liable for the torts of their employee? Discuss the modern approach adopted by courts.",
    model_answer: "Vicarious liability makes an employer liable for torts of their employee even without fault. Traditional tests required: (1) Employment relationship; (2) Tort committed in course of employment. Modern approach (Barclays Bank v Grant) considers: fairness, insurance, deterrence, and control. The relationship need not be traditional employment. Courts now look at: (1) Degree of control; (2) Integration into business; (3) Risk allocation; (4) Who was profit/loss bearer. This extends liability to independent contractors and non-traditional relationships.",
    rubric: "Doctrine explanation (15), traditional test (15), modern approach (20), application (10). Total: 60 marks. Pass: 30+" },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: "legal_ninja" });
    console.log("Connected to MongoDB");

    const count = await Question.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Database has ${count} questions. Clearing and reseeding...`);
      await Question.deleteMany({});
      console.log('✅ Cleared old questions.');
    }

    const mcqDocs = FALLBACK_QUESTIONS.map(q => ({
      ...q,
      source: "bank",
      approved: true,
      validated: true,
      allowed_roles: ["all"],
      used_count: 0
    }));

    const essayDocs = ESSAY_QUESTIONS.map(q => ({
      ...q,
      source: "bank",
      approved: true,
      validated: true,
      allowed_roles: ["all"],
      used_count: 0
    }));

    const allDocs = [...mcqDocs, ...essayDocs];
    await Question.insertMany(allDocs);
    console.log(`Successfully seeded ${allDocs.length} questions (${mcqDocs.length} MCQ + ${essayDocs.length} Essay) into the bank.`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
