'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-improvement-suggestions.ts';
import '@/ai/flows/generate-eco-tip.ts';
