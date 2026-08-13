import { createRequire } from "node:module";

import winkNLP, { type Model, type WinkMethods } from "wink-nlp";

import { ASSISTANT_CUSTOM_ENTITIES } from "@/lib/assistant/nlp/lexicon";

const require = createRequire(import.meta.url);

let nlp: WinkMethods | null = null;
let initFailed = false;

function loadWinkModel(): Model {
  const loaded = require("wink-eng-lite-web-model") as Model & { default?: Model };
  if (loaded && typeof loaded === "object" && "core" in loaded) return loaded;
  if (loaded?.default && typeof loaded.default === "object" && "core" in loaded.default) {
    return loaded.default;
  }
  throw new Error("Assistant NLP model failed to load.");
}

/** wink-nlp singleton. Returns null if the model cannot initialize (parser still has a lexicon fallback). */
export function getAssistantNlp(): WinkMethods | null {
  if (nlp) return nlp;
  if (initFailed) return null;

  try {
    const instance = winkNLP(loadWinkModel());
    instance.learnCustomEntities(ASSISTANT_CUSTOM_ENTITIES, {
      matchValue: true,
      useEntity: false,
      usePOS: false,
    });
    nlp = instance;
    return nlp;
  } catch (error) {
    initFailed = true;
    console.error("[assistant-nlp] Failed to initialize wink-nlp.", error);
    return null;
  }
}

export type TWinkCustomEntity = {
  value: string;
  type: string;
};

/** Extract custom entities from an already normalized + typo-corrected query. */
export function extractAssistantEntities(normalizedQuery: string): TWinkCustomEntity[] {
  if (!normalizedQuery) return [];

  const engine = getAssistantNlp();
  if (!engine) return [];

  try {
    const doc = engine.readDoc(normalizedQuery);
    const raw = doc.customEntities().out(engine.its.detail);
    if (!Array.isArray(raw)) return [];

    return raw.filter((item): item is TWinkCustomEntity => {
      if (typeof item !== "object" || item == null) return false;
      const record = item as { value?: unknown; type?: unknown };
      return typeof record.value === "string" && typeof record.type === "string";
    });
  } catch (error) {
    console.error("[assistant-nlp] Entity extraction failed.", error);
    return [];
  }
}
