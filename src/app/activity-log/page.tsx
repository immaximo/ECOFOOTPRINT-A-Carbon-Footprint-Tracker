
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoaderCircle } from 'lucide-react';
import { format } from 'date-fns';
import { buildings } from '@/lib/data';

type ActivityLog = {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  timestamp: Timestamp;
  details: {
    buildingId: string;
    month: string;
  };
};

const buildingNameMap = new Map(buildings.map(b => [b.id, b.name]));

export default function ActivityLogPage() {
  const firestore = useFirestore();
  
  const activityLogQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'activityLogs'), orderBy('timestamp', 'desc')) : null),
    [firestore]
  );
  
  const { data: logs, isLoading, error } = useCollection<ActivityLog>(activityLogQuery);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          User Activity Log
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            A log of recent data submissions and modifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
          )}
          {error && <p className="text-destructive">Error: {error.message}</p>}
          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.userEmail}</TableCell>
                      <TableCell>
                        <span className="capitalize">{log.action.replace('_', ' ')}</span>
                      </TableCell>
                      <TableCell>
                        Data for{' '}
                        <strong>{buildingNameMap.get(log.details.buildingId) || log.details.buildingId}</strong>
                        {' '}for month{' '}
                        <strong>{format(new Date(log.details.month), 'MMMM yyyy')}</strong>
                      </TableCell>
                      <TableCell>
                        {log.timestamp ? format(log.timestamp.toDate(), 'PPP p') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No activity logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
