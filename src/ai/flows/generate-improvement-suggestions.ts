'use server';

import { ai, googleAI } from '@/ai/genkit';
import { z } from 'zod';

const GenerateImprovementSuggestionsInputSchema = z.object({
  trendAnalysis: z
    .string()
    .describe('Trend analysis of carbon emission data, highlighting areas of concern.'),
});
export type GenerateImprovementSuggestionsInput = z.infer<
  typeof GenerateImprovementSuggestionsInputSchema
>;

const GenerateImprovementSuggestionsOutputSchema = z.string().describe(
  'A list of specific, actionable strategies for reducing the campus carbon footprint, formatted as a simple bulleted list.'
);
export type GenerateImprovementSuggestionsOutput = z.infer<
  typeof GenerateImprovementSuggestionsOutputSchema
>;

const generateImprovementSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateImprovementSuggestionsFlow',
    inputSchema: GenerateImprovementSuggestionsInputSchema,
    outputSchema: GenerateImprovementSuggestionsOutputSchema,
  },
  async (input: GenerateImprovementSuggestionsInput) => {
    try {
      const response = await ai.generate({
        prompt: `You are an expert sustainability consultant for university campuses. Based on the carbon emission trend analysis provided, suggest specific, actionable strategies for reducing the campus's carbon footprint. Format the suggestions as a simple bulleted list (e.g., "- Suggestion 1\n- Suggestion 2").

Trend Analysis:
${input.trendAnalysis}`,
        model: googleAI.model('gemini-2.5-flash'), // Use a supported model
      });

      // Access the text property directly
      const text = response?.text ?? 'Could not generate improvement suggestions.';
      console.log('[AI Suggestions Output]:', text);

      return text;
    } catch (error) {
      console.error('Error generating improvement suggestions:', error);
      return 'Could not generate improvement suggestions at this time.';
    }
  }
);

export async function generateImprovementSuggestions(
  input: GenerateImprovementSuggestionsInput
): Promise<GenerateImprovementSuggestionsOutput> {
  return generateImprovementSuggestionsFlow(input);
}
