
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { downloadReport } from '@/lib/actions';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

const ReportSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: 'Please select a start date.' }),
    to: z.date({ required_error: 'Please select an end date.' }),
  }),
  includeElectricity: z.boolean().default(true),
  includeWater: z.boolean().default(true),
  includeWaste: z.boolean().default(true),
});

type ReportInput = z.infer<typeof ReportSchema>;

export function ReportForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ReportInput>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      dateRange: undefined,
      includeElectricity: true,
      includeWater: true,
      includeWaste: true,
    },
  });

  useEffect(() => {
    form.reset({
      dateRange: {
        from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        to: new Date(),
      },
      includeElectricity: true,
      includeWater: true,
      includeWaste: true,
    });
  }, [form]);

  function onSubmit(values: ReportInput) {
    startTransition(async () => {
      const result = await downloadReport(values);

      if (result.success && result.data) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
          title: 'Report Generated',
          description: 'Your CSV report has been downloaded.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Generating Report',
          description: result.error,
        });
        console.error(result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date range</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={'outline'}
                    className={cn(
                      'w-[300px] justify-start text-left font-normal',
                      !field.value?.from && 'text-muted-foreground'
                    )}
                    disabled={!field.value}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value?.from ? (
                      field.value.to ? (
                        <>
                          {format(field.value.from, 'LLL dd, y')} -{' '}
                          {format(field.value.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(field.value.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Loading...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                {field.value && (
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={field.value.from}
                      selected={field.value as DateRange}
                      onSelect={field.onChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                )}
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Include Data Categories</FormLabel>
          <FormField
            control={form.control}
            name="includeElectricity"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Electricity Usage (kWh)
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="includeWater"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Water Consumption (m³)
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="includeWaste"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Waste Generation (kg)
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          )}
          Download Report
        </Button>
      </form>
    </Form>
  );
}
