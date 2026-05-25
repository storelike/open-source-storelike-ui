import type { FaqEntry } from "./types.js";

const DEFAULT_STORE_URL = "http://store-sqlite:3001";

export async function buildContext(): Promise<string> {
  const storeUrl = process.env.STORE_URL ?? DEFAULT_STORE_URL;

  try {
    const response = await fetch(`${storeUrl}/faq`);

    if (!response.ok) {
      return "No FAQ data available at this time.";
    }

    const faqEntries: FaqEntry[] = await response.json() as FaqEntry[];

    if (faqEntries.length === 0) {
      return "No FAQ entries found.";
    }

    const formattedEntries = faqEntries
      .map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
      .join("\n\n");

    return `<non_executable_data>\nFrequently Asked Questions:\n\n${formattedEntries}\n</non_executable_data>`;
  } catch {
    return "FAQ service is temporarily unavailable.";
  }
}
