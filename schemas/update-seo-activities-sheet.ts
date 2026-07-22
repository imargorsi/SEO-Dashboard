import { z } from "zod";

export const updateSeoActivitiesSheetSchema = z.object({
  spreadsheetUrl: z.string().trim().min(1, "Spreadsheet Url Is Required.").max(2048),
});

export type UpdateSeoActivitiesSheetInput = z.infer<typeof updateSeoActivitiesSheetSchema>;
