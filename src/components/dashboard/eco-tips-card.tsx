
'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEcoTip } from '@/lib/actions';
import { Lightbulb, LoaderCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EcoTipsCard() {
  const [isPending, startTransition] = useTransition();
  const [tip, setTip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTip = () => {
    startTransition(async () => {
      setError(null);
      const result = await getEcoTip();
      if (result.success && result.data) {
        setTip(result.data);
      } else {
        setError(result.error || 'Failed to generate a tip.');
      }
    });
  };

  // Fetch a tip when the component mounts
  useEffect(() => {
    handleGenerateTip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { title, description } = useMemo(() => {
    if (!tip) return { title: null, description: null };
    const match = tip.match(/\*\*(.*?)\*\*/);
    if (match) {
      return {
        title: match[1],
        description: tip.replace(match[0], '').trim(),
      };
    }
    return { title: null, description: tip };
  }, [tip]);


  return (
    <Card className="h-full flex flex-col sm:flex-row items-center sm:justify-between p-4">
      <div className="flex items-center gap-3">
        <Lightbulb className="text-yellow-400 size-6" />
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">Eco Tip</CardTitle>
          {isPending && (
            <div className="flex items-center gap-2 mt-1">
              <LoaderCircle className="animate-spin h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Generating tip...</span>
            </div>
          )}
          {error && !isPending && (
             <p className="text-sm text-destructive mt-1">{error}</p>
          )}
          {tip && !isPending && (
            <p className="text-sm text-muted-foreground mt-1">
              {title && <strong className="font-semibold text-foreground">{title}</strong>} {description}
            </p>
          )}
        </div>
      </div>
      <Button onClick={handleGenerateTip} disabled={isPending} size="sm" variant="ghost" className="mt-2 sm:mt-0">
        {isPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        <span className="sr-only">New Tip</span>
      </Button>
    </Card>
  );
}
