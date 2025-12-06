import {
  ELECTRICITY_EMISSION_FACTOR,
  WATER_EMISSION_FACTOR,
  WASTE_EMISSION_FACTOR,
} from './constants';
import type { UsageData } from './data';
import type { WithId } from '@/firebase';

type EmissionSource = {
  electricityUsage: number;
  waterUsage: number;
  wasteGenerated: number;
};

export const calculateEmissionsForEntry = (entry: EmissionSource) => {
  const electricityEmissions =
    entry.electricityUsage * ELECTRICITY_EMISSION_FACTOR;
  const waterEmissions = entry.waterUsage * WATER_EMISSION_FACTOR;
  const wasteEmissions = entry.wasteGenerated * WASTE_EMISSION_FACTOR;
  return { electricityEmissions, waterEmissions, wasteEmissions };
};

export const calculateTotalEmissions = (entry: EmissionSource) => {
  const { electricityEmissions, waterEmissions, wasteEmissions } =
    calculateEmissionsForEntry(entry);
  return electricityEmissions + waterEmissions + wasteEmissions;
};

export const getCategoryAndBuildingData = (
  allUsageData: WithId<UsageData>[]
) => {
  // Calculate total emissions by category
  const totalEmissionsByCategory = allUsageData.reduce(
    (acc, entry) => {
      const { electricityEmissions, waterEmissions, wasteEmissions } =
        calculateEmissionsForEntry(entry);
      acc.electricity += electricityEmissions;
      acc.water += waterEmissions;
      acc.waste += wasteEmissions;
      return acc;
    },
    { electricity: 0, water: 0, waste: 0 }
  );

  const categoryData = [
    {
      name: 'Electricity',
      emissions: totalEmissionsByCategory.electricity,
      fill: 'var(--color-electricity)',
    },
    {
      name: 'Water',
      emissions: totalEmissionsByCategory.water,
      fill: 'var(--color-water)',
    },
    {
      name: 'Waste',
      emissions: totalEmissionsByCategory.waste,
      fill: 'var(--color-waste)',
    },
  ];

  // Aggregate data by building
  const buildingDataMap = new Map<
    string,
    { name: string; electricityUsage: number; waterUsage: number; wasteGenerated: number }
  >();

  for (const entry of allUsageData) {
    const building = buildingDataMap.get(entry.buildingId) || {
      name:
        buildings.find((b) => b.id === entry.buildingId)?.name ||
        entry.buildingId,
      electricityUsage: 0,
      waterUsage: 0,
      wasteGenerated: 0,
    };
    building.electricityUsage += entry.electricityUsage;
    building.waterUsage += entry.waterUsage;
    building.wasteGenerated += entry.wasteGenerated;
    buildingDataMap.set(entry.buildingId, building);
  }

  const buildingEmissionData = Array.from(buildingDataMap.values()).map(
    (building) => ({
      name: building.name,
      emissions: parseFloat(calculateTotalEmissions(building).toFixed(2)),
    })
  );

  return { categoryData, buildingEmissionData };
};

// Find the buildings constant from data.ts
import { buildings } from './data';
