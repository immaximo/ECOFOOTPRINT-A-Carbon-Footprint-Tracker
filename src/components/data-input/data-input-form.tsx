
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTransition, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DataInputSchema, type DataInput } from '@/lib/schemas';
import { getBuildings, type Building } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useUser, useFirestore } from '@/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { setDoc, doc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function DataInputForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const buildings = getBuildings();

  const form = useForm<DataInput>({
    resolver: zodResolver(DataInputSchema),
    defaultValues: {
      buildingId: '',
      electricityKwh: 0,
      waterCubicMeters: 0,
      wasteKg: 0,
      month: undefined,
    },
  });

  // Set default month on client side to avoid hydration errors
  useEffect(() => {
    form.reset({
      ...form.getValues(),
      month: new Date(),
    });
  }, [form]);


  async function onSubmit(values: DataInput) {
    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to submit data.',
        });
        return;
    }

    startTransition(async () => {
        const { buildingId, month, ...usageValues } = values;
        const monthString = month.toISOString().slice(0, 7); // YYYY-MM
        const docId = `${buildingId}_${monthString}`;
        const usageDataRef = doc(firestore, 'monthlyUsageData', docId);

        const dataToSave = {
            buildingId: buildingId,
            month: monthString,
            electricityUsage: usageValues.electricityKwh,
            waterUsage: usageValues.waterCubicMeters,
            wasteGenerated: usageValues.wasteKg,
            submittedBy: user.uid,
            submittedAt: serverTimestamp(), // Use server timestamp for consistency
            approved: false,
        };

        setDoc(usageDataRef, dataToSave, { merge: true }).catch(error => {
             const permissionError = new FirestorePermissionError({
              path: usageDataRef.path,
              operation: 'write', // 'write' covers create, update, set
              requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        const activityLogRef = collection(firestore, 'activityLogs');
        addDoc(activityLogRef, {
              userId: user.uid,
              userEmail: user.email,
              action: 'data_submitted', // or 'data_modified' logic can be added here
              timestamp: serverTimestamp(),
              details: {
                  buildingId: buildingId,
                  month: monthString,
              },
        }).catch(error => {
            console.error("Failed to write activity log", error);
             const permissionError = new FirestorePermissionError({
              path: activityLogRef.path,
              operation: 'create',
              requestResourceData: { userId: user.uid },
            });
            errorEmitter.emit('permission-error', permissionError);
        });


        toast({
            title: 'Success!',
            description: 'Data has been submitted successfully.',
        });
        form.reset({
            buildingId: values.buildingId,
            month: values.month,
            electricityKwh: 0,
            waterCubicMeters: 0,
            wasteKg: 0,
        });

    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Usage Report</CardTitle>
        <CardDescription>Enter the resource consumption data for a specific building and month.</CardDescription>
      </CardHeader>
      <CardContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="buildingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Month</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isPending || !field.value}
                      >
                        {field.value ? (
                          format(field.value, 'MMMM yyyy')
                        ) : (
                          <span>Pick a month</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                   {field.value && <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('2020-01-01') || isPending
                      }
                      initialFocus
                    />
                  </PopoverContent>}
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="electricityKwh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Electricity Usage (kWh)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 5000" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="waterCubicMeters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Water Consumption (m³)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 300" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="wasteKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waste Generation (kg)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 150" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending || !user}>
          {isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Submit Data
        </Button>
      </form>
    </Form>
    </CardContent>
    </Card>
  );
}
