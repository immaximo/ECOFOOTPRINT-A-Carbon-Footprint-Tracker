
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirestoreAdmin } from '@/firebase/admin';
import { buildings } from './data';
import { generateImprovementSuggestions } from '@/ai/flows/generate-improvement-suggestions';
import { generateEcoTip } from '@/ai/flows/generate-eco-tip';

export async function getImprovementSuggestions(trendAnalysis: string) {
  try {
    const suggestions = await generateImprovementSuggestions({ trendAnalysis });
    return { success: true, data: suggestions };
  } catch (error) {
    console.error('AI suggestion generation failed with exception:', error);
    return { success: false, error: 'Could not generate AI suggestions at this time.' };
  }
}

export async function getEcoTip() {
  try {
    const tip = await generateEcoTip();
    return { success: true, data: tip };
  } catch (error: any) {
    console.error('AI tip generation failed with exception:', error);
    const errorMessage = error.message || 'An unknown error occurred.';
    return { success: false, error: `Could not generate an AI tip due to a server error: ${errorMessage}` };
  }
}

const ReportSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  includeElectricity: z.boolean(),
  includeWater: z.boolean(),
  includeWaste: z.boolean(),
});


export async function downloadReport(values: z.infer<typeof ReportSchema>) {
    const validatedFields = ReportSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }
    
    const { dateRange, includeElectricity, includeWater, includeWaste } = validatedFields.data;
    
    const firestore = getFirestoreAdmin();
    const startMonth = dateRange.from.toISOString().slice(0, 7);
    const endMonth = dateRange.to.toISOString().slice(0, 7);

    try {
      const snapshot = await firestore.collection('monthlyUsageData')
          .where('month', '>=', startMonth)
          .where('month', '<=', endMonth)
          .get();
      
      if (snapshot.empty) {
        return { error: 'No data found for the selected date range.' };
      }
      
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const headers: string[] = ['building', 'month'];
      if (includeElectricity) headers.push('electricityUsage (kWh)');
      if (includeWater) headers.push('waterUsage (m³)');
      if (includeWaste) headers.push('wasteGenerated (kg)');
      headers.push('submittedByEmail');

      const csvRows = [headers.join(',')];
      
      const userIds = [...new Set(allData.map(d => d.submittedBy))];
      const userEmails = new Map<string, string>();
      if (userIds.length > 0) {
        const usersSnap = await firestore.collection('users').where('id', 'in', userIds).get();
        usersSnap.forEach(doc => {
            userEmails.set(doc.id, doc.data().email || 'Unknown');
        });
      }


      for (const entry of allData) {
          const buildingName = buildings.find(b => b.id === entry.buildingId)?.name || entry.buildingId;
          const userEmail = userEmails.get(entry.submittedBy) || 'Unknown';
          const rowData = [
              `"${buildingName}"`, // Wrap in quotes to handle commas in names
              entry.month
          ];
          if (includeElectricity) rowData.push(String(entry.electricityUsage || 0));
          if (includeWater) rowData.push(String(entry.waterUsage || 0));
          if (includeWaste) rowData.push(String(entry.wasteGenerated || 0));
          rowData.push(userEmail);
          
          csvRows.push(rowData.join(','));
      }

      const csv = csvRows.join('\n');
      
      return { success: true, data: csv };
    } catch(error: any) {
        console.error("Failed to generate CSV", error);
        return { error: 'Failed to fetch data and generate report. ' + error.message };
    }
}
