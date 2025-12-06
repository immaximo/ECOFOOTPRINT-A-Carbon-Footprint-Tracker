import { z } from 'zod';

export const DataInputSchema = z.object({
  buildingId: z.string().min(1, 'Please select a building.'),
  month: z.date({ required_error: 'Please select a month.' }),
  electricityKwh: z.coerce
    .number({ invalid_type_error: 'Must be a number.' })
    .min(0, 'Value must be positive.'),
  waterCubicMeters: z.coerce
    .number({ invalid_type_error: 'Must be a number.' })
    .min(0, 'Value must be positive.'),
  wasteKg: z.coerce
    .number({ invalid_type_error: 'Must be a number.' })
    .min(0, 'Value must be positive.'),
});

export type DataInput = z.infer<typeof DataInputSchema>;
