'use client';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, ResponsiveContainer, Sector } from 'recharts';
import type { FC } from 'react';

interface EmissionsByCategoryChartProps {
  data: { name: string; emissions: number; fill: string }[];
}

const chartConfig = {
  emissions: {
    label: 'Emissions (kgCO2e)',
  },
  electricity: {
    label: 'Electricity',
    color: "hsl(var(--chart-1))",
  },
  water: {
    label: 'Water',
     color: "hsl(var(--chart-2))",
  },
  waste: {
    label: 'Waste',
     color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;


const EmissionsByCategoryChart: FC<EmissionsByCategoryChartProps> = ({
  data,
}) => {
  return (
     <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-square">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="emissions"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};

export default EmissionsByCategoryChart;
