import "dotenv/config";
import { generateQuestion } from "./src/services/ai";

async function test() {
  console.log("Testing AI Question Generation...");
  try {
    const subjects = ["law_of_contract", "criminal_law", "evidence_law"];
    for (const subject of subjects) {
      console.log(`\n--- Subject: ${subject} ---`);
      const q = await generateQuestion({
        subject,
        track: "undergraduate_track",
        difficulty: "medium"
      });
      console.log(JSON.stringify(q, null, 2));
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
