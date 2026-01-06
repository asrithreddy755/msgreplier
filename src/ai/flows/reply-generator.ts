'use server';
/**
 * @fileOverview A flow for generating text message replies.
 *
 * This file defines the AI flow for the MsgCham AI feature. It includes:
 * - Input and output schemas for the AI model.
 * - The main prompt sent to the AI.
 * - The Genkit flow that orchestrates the AI call.
 * - An exported `generateReplies` function to be used by the UI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// 1. Define the input schema for the flow using Zod.
// This provides validation and type safety.
const ReplyGeneratorInputSchema = z.object({
  message: z.string().describe('The text message the user received.'),
  additionalInfo: z
    .string()
    .optional()
    .describe('Optional additional context provided by the user.'),
  userGender: z
    .string()
    .describe("The gender of the user who received the message."),
  replyCount: z
    .number()
    .min(1)
    .max(20)
    .describe('The number of reply suggestions to generate.'),
  replyTone: z.string().describe('The desired tone for the generated replies.'),
  replyLength: z
    .enum(['short', 'medium', 'long'])
    .describe('The desired approximate length of the replies.'),
});
export type ReplyGeneratorInput = z.infer<typeof ReplyGeneratorInputSchema>;

// 2. Define the output schema.
// We expect the AI to return an object with an array of strings.
const ReplyGeneratorOutputSchema = z.object({
  replies: z.array(z.string()).describe('An array of generated reply suggestions.'),
});
export type ReplyGeneratorOutput = z.infer<typeof ReplyGeneratorOutputSchema>;

// 3. Define the prompt that will be sent to the AI model.
// Handlebars syntax ({{...}}) is used to insert input values.
const replyPrompt = ai.definePrompt({
  name: 'replyPrompt',
  input: { schema: ReplyGeneratorInputSchema },
  output: { schema: ReplyGeneratorOutputSchema },
  prompt: `
    You are an expert at crafting witty, engaging, and natural text message replies that sound human, not like an AI.

    A user, who identifies as {{userGender}}, received the following message:
    "{{message}}"

    Here is some additional context about the situation, provided by the user:
    "{{#if additionalInfo}}{{additionalInfo}}{{else}}No additional context provided.{{/if}}"

    Based on this, generate {{replyCount}} different reply suggestions for the user.

    The replies should:
    - Be written in a {{replyTone}} tone.
    - Be approximately {{replyLength}} in length (short: ~5-15 words, medium: ~15-30 words, long: ~30-50 words).
    - Sound like something a real person would say. Avoid overly formal language or generic AI phrases.
  `,
});

// 4. Define the Genkit flow.
// This flow takes the validated input, calls the prompt, and returns the structured output.
const replyGeneratorFlow = ai.defineFlow(
  {
    name: 'replyGeneratorFlow',
    inputSchema: ReplyGeneratorInputSchema,
    outputSchema: ReplyGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await replyPrompt(input);
    return output!;
  }
);

// 5. Create an exported wrapper function.
// This is what the UI will call. It provides a clean interface to the flow.
export async function generateReplies(input: ReplyGeneratorInput): Promise<ReplyGeneratorOutput> {
  return await replyGeneratorFlow(input);
}

    