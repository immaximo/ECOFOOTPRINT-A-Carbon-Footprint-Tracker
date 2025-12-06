'use server';

import { ai, googleAI } from '@/ai/genkit';
import { z } from 'zod';

/**
 * ------------------------------
 * 1. Generate Eco Tip
 * ------------------------------
 */
const generateEcoTipFlow = ai.defineFlow(
  {
    name: 'generateEcoTipFlow',
  },
  async () => {
    try {
      const response = await ai.generate({
        prompt: `You are a sustainability expert. Generate a single, concise, and actionable sustainability tip suitable for a university campus. The tip should be easy to understand and implement by students or staff. Start the tip with a short, catchy title in bold (e.g., "**Go Paperless!**"). Avoid repeating tips that have been suggested before. Cover a wide variety of areas such as energy saving, waste reduction, water conservation, transportation, food sustainability, and responsible consumption. Make sure each tip is unique and practical for a university campus setting.`,
        model: googleAI.model('gemini-2.5-flash'), // Supported model
      });

      // Corrected: access the text directly
      return response?.text ?? 'Could not generate an eco tip at this time.';
    } catch (error) {
      console.error('Error generating eco tip:', error);
      return 'Could not generate an eco tip at this time.';
    }
  }
);

export async function generateEcoTip(): Promise<string> {
  return await generateEcoTipFlow();
}

/**
 * ------------------------------
 * 2. Generate Carbon Improvement Suggestions
 * ------------------------------
 */

const GenerateImprovementSuggestionsInputSchema = z.object({
  trendAnalysis: z.string().describe(
    'Trend analysis of carbon emission data, highlighting areas of concern.'
  ),
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

Trend Analysis: ${input.trendAnalysis}`,
        model: googleAI.model('gemini-2.5-flash'), // Supported model
      });

      // Corrected: access the text directly
      return response?.text ?? 'Could not generate improvement suggestions at this time.';
    } catch (error) {
      console.error('Error generating improvement suggestions:', error);
      return 'Could not generate improvement suggestions at this time.';
    }
  }
);

export async function generateImprovementSuggestions(
  input: GenerateImprovementSuggestionsInput
): Promise<GenerateImprovementSuggestionsOutput> {
  return await generateImprovementSuggestionsFlow(input);
}
