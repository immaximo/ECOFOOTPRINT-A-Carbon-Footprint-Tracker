
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

const DataInputForm = dynamic(
  () => import('@/components/data-input/data-input-form').then((mod) => mod.DataInputForm),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
           <CardTitle>Monthly Usage Report</CardTitle>
          <CardDescription>Enter the resource consumption data for a specific building and month.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    ),
  }
);


export default function DataInputPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between space-y-2 mb-4">
          <h1 className="text-4xl font-bold tracking-tight font-headline">
            Data Input
          </h1>
        </div>
        <DataInputForm />
      </div>
    </div>
  );
}
