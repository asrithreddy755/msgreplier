import { z } from "zod";

export const questionSchema = z.object({
    text: z.string().min(5, "Question must be at least 5 characters"),
    options: z
        .array(z.string().min(1, "Option cannot be empty"))
        .min(2, "At least 2 options required")
        .max(4, "Max 4 options"),
    correctOptionIndex: z.number().int().nonnegative(),
    hint: z.string().optional(),
}).refine(
    (data) => data.correctOptionIndex < data.options.length,
    {
        message: "Correct answer must match one of the options",
        path: ["correctOptionIndex"],
    }
);

export const quizFormSchema = z.object({
    sender_name: z.string().min(2, "Sender name required"),
    receiver_name: z.string().min(2, "Receiver name required"),
    time_limit_seconds: z.string().regex(/^\d+$/, "Valid time limit required (in minutes)"),
    questions: z.array(questionSchema).min(1, "You must add at least one question"),
}) satisfies z.ZodType<QuizFormValues>;

export interface QuizFormValues {
    sender_name: string;
    receiver_name: string;
    time_limit_seconds: string;
    questions: {
        text: string;
        options: string[];
        correctOptionIndex: number;
        hint?: string;
    }[];
}
