'use server';
/**
 * @fileOverview Optimizes repeated text for a specific social media platform.
 *
 * - optimizeRepeatedTextForPlatform - A function that optimizes the repetition of text based on platform formatting rules and character limits.
 * - OptimizeRepeatedTextInput - The input type for the optimizeRepeatedTextForPlatform function.
 * - OptimizeRepeatedTextOutput - The return type for the optimizeRepeatedTextForPlatform function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeRepeatedTextInputSchema = z.object({
  platform: z
    .string()
    .describe(
      'The social media platform for which the text is being optimized (e.g., Instagram, WhatsApp, Telegram, X, Facebook).'
    ),
  text: z.string().describe('The text to be repeated.'),
  characterLimit: z.number().describe('The character limit of the platform.'),
});
export type OptimizeRepeatedTextInput = z.infer<typeof OptimizeRepeatedTextInputSchema>;

const OptimizeRepeatedTextOutputSchema = z.object({
  optimizedText: z
    .string()
    .describe(
      'The optimized repeated text, considering the platform formatting rules and character limits.'
    ),
  repeatCount: z.number().describe('The number of times the text is repeated.'),
  spacing: z
    .string()
    .describe(
      'The spacing used between each repetition of the text (e.g., space, newline).'
    ),
});
export type OptimizeRepeatedTextOutput = z.infer<typeof OptimizeRepeatedTextOutputSchema>;

export async function optimizeRepeatedTextForPlatform(
  input: OptimizeRepeatedTextInput
): Promise<OptimizeRepeatedTextOutput> {
  return optimizeRepeatedTextForPlatformFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeRepeatedTextForPlatformPrompt',
  input: {schema: OptimizeRepeatedTextInputSchema},
  output: {schema: OptimizeRepeatedTextOutputSchema},
  prompt: `You are an expert in social media formatting.

  Given the following social media platform, text to repeat, and character limit, optimize the text repetition to be well-formatted and visually appealing.

  Platform: {{{platform}}}
  Text: {{{text}}}
  Character Limit: {{{characterLimit}}}

  Consider the platform's formatting rules and character limits to determine the ideal number of repeats and spacing.

  Return the optimized text, the number of times the text is repeated, and the spacing used between repetitions.
  Ensure that the optimized text does not exceed the character limit.

  The optimizedText field should contain the repeated text.  The repeatCount field should contain the number of repetitions, and the spacing field should contain the character(s) used for spacing.
  `,
});

const optimizeRepeatedTextForPlatformFlow = ai.defineFlow(
  {
    name: 'optimizeRepeatedTextForPlatformFlow',
    inputSchema: OptimizeRepeatedTextInputSchema,
    outputSchema: OptimizeRepeatedTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
