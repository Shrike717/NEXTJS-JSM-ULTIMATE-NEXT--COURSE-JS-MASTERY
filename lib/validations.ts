import * as z from "zod";
// Das sind die Validierungs FormSchemas für die Formulare

export const QuestionsSchema = z.object({
  title: z.string().min(5).max(130),
  explanation: z.string().min(100),
  // Ein Array mit Strings. Mindestens 1 Tag, maximal 3 Tags. Jeder String muss mindestens 1 und maximal 15 Zeichen lang sein.
  tags: z.array(z.string().min(1).max(15)).min(1).max(3),
});
