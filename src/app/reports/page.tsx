'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the form component with SSR turned off
const ReportForm = dynamic(
  () => import('@/components/reports/report-form').then((mod) => mod.ReportForm),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-8">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-[300px]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
    )
  }
);

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between space-y-2 mb-4">
          <h1 className="text-4xl font-bold tracking-tight font-headline">
            Download Reports
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Generate Consumption Report</CardTitle>
            <CardDescription>Select a date range and the data categories to include in the CSV report.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
