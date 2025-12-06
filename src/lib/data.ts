export type Building = {
  id: string;
  name: string;
};

export type UsageData = {
  id: string;
  buildingId: string;
  month: string; // "YYYY-MM"
  electricityUsage: number;
  waterUsage: number;
  wasteGenerated: number;
};

export const buildings: Building[] = [
  { id: 'cics', name: 'CICS Building' },
  { id: 'steer', name: 'STEER Hub' },
  { id: 'library', name: 'Main Library' },
  { id: 'ceafa', name: 'CEAFA Building' },
  { id: 'admin', name: 'Admin Building' },
];

export const getBuildings = () => buildings;

export const getBuildingRankings = (
  buildingData: (Building & {
    electricityUsage: number;
    waterUsage: number;
    wasteGenerated: number;
    totalEmissions: number;
  })[]
) => {
  const rankings = buildingData.map((building) => ({
    name: building.name,
    emissions: building.totalEmissions,
  }));

  return rankings.sort((a, b) => a.emissions - b.emissions);
};
