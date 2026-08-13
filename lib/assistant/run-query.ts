import type { AuthContext } from "@/lib/auth/guards";
import { permissionForAssistantParse } from "@/lib/assistant/detect-intent";
import {
  deniedAssistantAnswer,
  handleAssistantIntent,
  unknownAssistantAnswer,
} from "@/lib/assistant/handle-intent";
import { appendAssistantHistory } from "@/lib/assistant/history";
import { parseAssistantQuery } from "@/lib/assistant/nlp/parse-query";
import { getProjectAccessForUser } from "@/lib/projects/get-project-access";
import { hasPermission } from "@/lib/rbac/access";
import type { AssistantQueryInput } from "@/schemas/assistant";
import type { TAssistantQueryResult } from "@/types/assistant.types";

function denyModule(
  permission: "leads.view" | "analytics.view" | "seo_activities.view" | null,
): "leads" | "analytics" | "seo_activities" {
  if (permission?.startsWith("leads.")) return "leads";
  if (permission?.startsWith("seo_activities.")) return "seo_activities";
  return "analytics";
}

export async function runAssistantQuery(
  auth: AuthContext,
  projectId: string,
  input: AssistantQueryInput,
): Promise<TAssistantQueryResult> {
  const parsed = parseAssistantQuery(input.query);
  const intent = parsed.kind;
  const userId = auth.user._id.toString();

  let message: string;
  let action: TAssistantQueryResult["action"];
  let items: TAssistantQueryResult["items"];

  if (parsed.kind === "unknown") {
    const answer = unknownAssistantAnswer();
    message = answer.message;
    action = answer.action;
    items = answer.items;
  } else {
    const requiredPermission = permissionForAssistantParse(parsed);
    const access = await getProjectAccessForUser(auth, projectId);
    const allowed =
      requiredPermission != null &&
      access != null &&
      hasPermission(access.permissions, requiredPermission);

    if (!allowed) {
      const answer = deniedAssistantAnswer(denyModule(requiredPermission));
      message = answer.message;
      action = answer.action;
      items = answer.items;
    } else {
      const answer = await handleAssistantIntent(projectId, parsed);
      message = answer.message;
      action = answer.action;
      items = answer.items;
    }
  }

  const history = await appendAssistantHistory({
    projectId,
    userId,
    query: input.query,
    intent,
  });

  return {
    message,
    intent,
    action,
    items,
    history,
  };
}
