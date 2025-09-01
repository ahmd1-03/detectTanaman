'use server';
/**
 * @fileOverview A plant problem diagnosis AI agent.
 *
 * - diagnosePlant - A function that handles the plant diagnosis process.
 * - DiagnosePlantInput - The input type for the diagnosePlant function.
 * - DiagnosePlantOutput - The return type for the diagnosePlant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePlantInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the plant.'),
});
export type DiagnosePlantInput = z.infer<typeof DiagnosePlantInputSchema>;

const DiagnosePlantOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the input is a plant.'),
    commonName: z.string().describe('The common name of the identified plant.'),
    scientificName: z.string().describe('The Latin name of the identified plant.'),
    category: z.string().describe("The plant's category (e.g., Fruit, Vegetable, Tree, Flower, Ornamental)."),
  }),
  diagnosis: z.object({
    isHealthy: z.boolean().describe('Whether or not the plant is healthy.'),
    healthDescription: z.string().describe("A diagnosis of the plant's health, including any issues."),
  }),
  care: z.object({
    benefits: z.string().describe("A summary of the plant's benefits and uses."),
    watering: z.string().describe("Instructions on how often to water the plant."),
    sunlight: z.string().describe("Instructions on the amount of sunlight the plant needs.")
  })
});
export type DiagnosePlantOutput = z.infer<typeof DiagnosePlantOutputSchema>;

export async function diagnosePlant(input: DiagnosePlantInput): Promise<DiagnosePlantOutput> {
  return diagnosePlantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantPrompt',
  input: {schema: DiagnosePlantInputSchema},
  output: {schema: DiagnosePlantOutputSchema},
  prompt: `You are an expert botanist. Analyze the provided image and description to identify the plant, assess its health, and provide detailed information about it.

Your response must be in Bahasa Indonesia.

1.  **Identification**:
    *   Determine if the image contains a plant. If not, set \`isPlant\` to false and leave other fields empty.
    *   If it is a plant, identify its common and scientific name.
    *   Determine its category (e.g., Fruit, Vegetable, Tree, Flower, Ornamental).

2.  **Diagnosis**:
    *   Assess the plant's health from the image.
    *   Set \`isHealthy\` to true or false.
    *   Provide a brief \`healthDescription\` explaining your assessment (e.g., "The plant appears healthy with vibrant leaves," or "The plant shows signs of nutrient deficiency with yellowing leaves.").

3.  **Care & Benefits**:
    *   Provide a summary of the plant's benefits and common uses in the \`benefits\` field.
    *   Provide simple watering instructions in the \`watering\` field.
    *   Provide simple sunlight instructions in the \`sunlight\` field.

Use the following as the primary source of information about the plant.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}`,
});

const diagnosePlantFlow = ai.defineFlow(
  {
    name: 'diagnosePlantFlow',
    inputSchema: DiagnosePlantInputSchema,
    outputSchema: DiagnosePlantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
