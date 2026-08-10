import { AssistantQueryHistory } from "@/models";
import type { TAssistantHistoryItem } from "@/types/assistant.types";

export const ASSISTANT_HISTORY_LIMIT = 5;

function serializeHistoryItem(doc: {
  _id: { toString(): string };
  query: string;
  intent: string;
  createdAt?: Date;
}): TAssistantHistoryItem {
  return {
    id: doc._id.toString(),
    query: doc.query,
    intent: doc.intent,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  };
}

export async function listAssistantHistory(
  projectId: string,
  userId: string,
): Promise<TAssistantHistoryItem[]> {
  const docs = await AssistantQueryHistory.find({ projectId, userId })
    .sort({ createdAt: -1 })
    .limit(ASSISTANT_HISTORY_LIMIT)
    .select("query intent createdAt")
    .lean();

  return docs.map((doc) =>
    serializeHistoryItem({
      _id: doc._id as { toString(): string },
      query: doc.query,
      intent: doc.intent,
      createdAt: doc.createdAt as Date | undefined,
    }),
  );
}

export async function appendAssistantHistory(input: {
  projectId: string;
  userId: string;
  query: string;
  intent: string;
}): Promise<TAssistantHistoryItem[]> {
  await AssistantQueryHistory.create({
    projectId: input.projectId,
    userId: input.userId,
    query: input.query,
    intent: input.intent,
  });

  const stale = await AssistantQueryHistory.find({
    projectId: input.projectId,
    userId: input.userId,
  })
    .sort({ createdAt: -1 })
    .skip(ASSISTANT_HISTORY_LIMIT)
    .select("_id");

  if (stale.length > 0) {
    await AssistantQueryHistory.deleteMany({
      _id: { $in: stale.map((doc) => doc._id) },
    });
  }

  return listAssistantHistory(input.projectId, input.userId);
}
