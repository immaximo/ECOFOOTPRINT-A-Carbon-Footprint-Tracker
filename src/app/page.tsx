
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  calculateTotalEmissions,
  getCategoryAndBuildingData,
} from '@/lib/calculations';
import EmissionsSummaryCard from '@/components/dashboard/emissions-summary-card';
import EmissionsByCategoryChart from '@/components/dashboard/emissions-by-category-chart';
import EmissionsByBuildingChart from '@/components/dashboard/emissions-by-building-chart';
import EmissionsTrendChart from '@/components/dashboard/emissions-trend-chart';
import ImprovementSuggestions from '@/components/dashboard/improvement-suggestions';
import { Building, Zap, Droplets, Trash2, LoaderCircle } from 'lucide-react';
import EcoTipsCard from '@/components/dashboard/eco-tips-card';
import GreenRankingsCard from '@/components/dashboard/green-rankings-card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { format } from 'date-fns';
import { UsageData } from '@/lib/data';
import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const usageDataQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'monthlyUsageData')) : null),
    [firestore, user]
  );
  const {
    data: usageData,
    isLoading: isUsageDataLoading,
    error,
  } = useCollection<UsageData>(usageDataQuery);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const {
    overallTotals,
    totalEmissions,
    categoryData,
    buildingEmissionData,
    trendData,
    trendAnalysisText,
  } = useMemo(() => {
    if (!usageData) {
      return {
        overallTotals: { electricityUsage: 0, waterUsage: 0, wasteGenerated: 0 },
        totalEmissions: 0,
        categoryData: [],
        buildingEmissionData: [],
        trendData: [],
        trendAnalysisText: 'No data available for analysis.',
      };
    }

    const totals = usageData.reduce(
      (acc, entry) => {
        acc.electricityUsage += entry.electricityUsage;
        acc.waterUsage += entry.waterUsage;
        acc.wasteGenerated += entry.wasteGenerated;
        return acc;
      },
      { electricityUsage: 0, waterUsage: 0, wasteGenerated: 0 }
    );

    const emissions = calculateTotalEmissions(totals);
    const { categoryData, buildingEmissionData } =
      getCategoryAndBuildingData(usageData);

    const monthlyTotalsMap = new Map<
      string,
      { electricityUsage: number; waterUsage: number; wasteGenerated: number }
    >();
    usageData.forEach((entry) => {
      const monthData = monthlyTotalsMap.get(entry.month) || {
        electricityUsage: 0,
        waterUsage: 0,
        wasteGenerated: 0,
      };
      monthData.electricityUsage += entry.electricityUsage;
      monthData.waterUsage += entry.waterUsage;
      monthData.wasteGenerated += entry.wasteGenerated;
      monthlyTotalsMap.set(entry.month, monthData);
    });

    const monthlyTotals = Array.from(monthlyTotalsMap.entries())
      .map(([month, totals]) => ({ month, ...totals }))
      .sort((a, b) => a.month.localeCompare(b.month)); // Sort by month

    const trend = monthlyTotals.map((entry) => ({
      month: format(new Date(entry.month + '-02'), 'MMM yy'), // Add day to make it a valid date
      emissions: parseFloat(calculateTotalEmissions(entry).toFixed(2)),
    }));

    const analysisText = `
      Overall carbon emissions show a trend over the last ${trend.length} months.
      - Total Electricity Emission: ${categoryData[0]?.emissions.toFixed(
        2
      )} kgCO2e
      - Total Water Emission: ${categoryData[1]?.emissions.toFixed(2)} kgCO2e
      - Total Waste Emission: ${categoryData[2]?.emissions.toFixed(2)} kgCO2e
      - Busiest building seems to be ${
        [...buildingEmissionData].sort((a, b) => b.emissions - a.emissions)[0]
          ?.name
      } with ${[...buildingEmissionData]
      .sort((a, b) => b.emissions - a.emissions)[0]
      ?.emissions.toFixed(2)} kgCO2e.
      Analyze the monthly trend data and provide insights: ${JSON.stringify(
        trend
      )}.
    `;

    return {
      overallTotals: totals,
      totalEmissions: emissions,
      categoryData,
      buildingEmissionData,
      trendData: trend,
      trendAnalysisText: analysisText,
    };
  }, [usageData]);

  if (isUserLoading || isUsageDataLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-theme(space.12))] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-theme(space.12))] items-center justify-center">
        <p className="text-destructive">Error loading data: {error.message}</p>
      </div>
    );
  }
  
  if (!usageData || usageData.length === 0) {
     return (
       <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
          <div className="mb-6">
            <EcoTipsCard />
          </div>
          <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Campus Dashboard
            </h1>
          </div>
         <Card>
           <CardHeader>
             <CardTitle>No Data Yet</CardTitle>
           </CardHeader>
           <CardContent>
             <p>No monthly usage data has been submitted yet. Go to the <a href="/data-input" className="underline text-primary">Data Input</a> page to get started.</p>
           </CardContent>
         </Card>
       </div>
     );
  }


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="mb-6">
        <EcoTipsCard />
      </div>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Campus Dashboard
        </h1>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <EmissionsSummaryCard
          title="Total Carbon Footprint"
          value={totalEmissions}
          unit="kgCO2e"
          icon={Building}
          description="Total emissions from all sources"
        />
        <EmissionsSummaryCard
          title="Electricity Usage"
          value={overallTotals.electricityUsage}
          unit="kWh"
          icon={Zap}
          description="Total electricity consumption"
        />
        <EmissionsSummaryCard
          title="Water Consumption"
          value={overallTotals.waterUsage}
          unit="m³"
          icon={Droplets}
          description="Total water consumption"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Emissions Trend</CardTitle>
                <CardDescription>
                  Monthly carbon footprint of the campus.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <EmissionsTrendChart data={trendData} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Emissions by Category</CardTitle>
                <CardDescription>
                  Breakdown of emissions by source.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmissionsByCategoryChart data={categoryData} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Emissions by Building</CardTitle>
                <CardDescription>
                  Comparison of carbon footprint across different campus
                  buildings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmissionsByBuildingChart data={buildingEmissionData} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-1">
            <ImprovementSuggestions trendAnalysis={trendAnalysisText} />
          </div>
        </div>
        <div className="lg:col-span-1 space-y-4">
          <GreenRankingsCard usageData={usageData} />
          <Card>
            <CardHeader>
              <CardTitle>Overall Usage</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <EmissionsSummaryCard
                title="Waste Generation"
                value={overallTotals.wasteGenerated}
                unit="kg"
                icon={Trash2}
                description="Total waste generated"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
