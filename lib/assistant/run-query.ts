import type { AuthContext } from "@/lib/auth/guards";
import {
  detectAssistantIntent,
  permissionForAssistantIntent,
} from "@/lib/assistant/detect-intent";
import {
  deniedAssistantAnswer,
  handleAssistantIntent,
  unknownAssistantAnswer,
} from "@/lib/assistant/handle-intent";
import { appendAssistantHistory } from "@/lib/assistant/history";
import { getProjectAccessForUser } from "@/lib/projects/get-project-access";
import { hasPermission } from "@/lib/rbac/access";
import type { AssistantQueryInput } from "@/schemas/assistant";
import type { TAssistantQueryResult } from "@/types/assistant.types";

export async function runAssistantQuery(
  auth: AuthContext,
  projectId: string,
  input: AssistantQueryInput,
): Promise<TAssistantQueryResult> {
  const intent = detectAssistantIntent(input.query);
  const userId = auth.user._id.toString();

  let message: string;
  let action: TAssistantQueryResult["action"];

  if (intent === "unknown") {
    const answer = unknownAssistantAnswer();
    message = answer.message;
    action = answer.action;
  } else {
    const requiredPermission = permissionForAssistantIntent(intent);
    const access = await getProjectAccessForUser(auth, projectId);
    const allowed =
      requiredPermission != null &&
      access != null &&
      hasPermission(access.permissions, requiredPermission);

    if (!allowed) {
      const answer = deniedAssistantAnswer(
        requiredPermission?.startsWith("leads.") ? "leads" : "analytics",
      );
      message = answer.message;
      action = answer.action;
    } else {
      const answer = await handleAssistantIntent(projectId, intent);
      message = answer.message;
      action = answer.action;
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
    history,
  };
}
