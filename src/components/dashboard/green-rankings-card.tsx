import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useMemo } from 'react';
import { buildings, UsageData } from '@/lib/data';
import { calculateTotalEmissions } from '@/lib/calculations';
import type { WithId } from '@/firebase';

export default function GreenRankingsCard({ usageData }: { usageData: WithId<UsageData>[] }) {

  const rankings = useMemo(() => {
    const buildingDataMap = new Map<
      string,
      { name: string; electricityUsage: number; waterUsage: number; wasteGenerated: number }
    >();

    for (const entry of usageData) {
      const building = buildingDataMap.get(entry.buildingId) || {
        name: buildings.find((b) => b.id === entry.buildingId)?.name || entry.buildingId,
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

    return buildingEmissionData.sort((a, b) => a.emissions - b.emissions);
  }, [usageData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
           <Award className="text-green-500"/>
          <span>Green Rankings</span>
        </CardTitle>
        <CardDescription>Which buildings are leading the way in sustainability?</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {rankings.map((building, index) => (
            <li key={building.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg w-6 text-center">{index + 1}</span>
                    <span>{building.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    {index === 0 && <Badge variant="default" className="bg-green-600">Green Champion</Badge>}
                     <span className="font-mono text-xs text-muted-foreground">{building.emissions.toFixed(0)} kgCO2e</span>
                </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
