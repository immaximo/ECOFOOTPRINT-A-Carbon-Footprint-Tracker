
'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getImprovementSuggestions } from '@/lib/actions';
import { Lightbulb, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// New component to parse and render a single suggestion
const SuggestionItem = ({ text }: { text: string }) => {
  // Split the text by the bold markdown `**`
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);

  return (
    <li>
      {parts.map((part, index) => {
        // If the part is wrapped in **, it's bold
        if (part.startsWith('**') && part.endsWith('**')) {
          // Remove the asterisks and wrap in <strong>
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        // Otherwise, it's just regular text
        return part;
      })}
    </li>
  );
};


export default function ImprovementSuggestions({
  trendAnalysis,
}: {
  trendAnalysis: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    startTransition(async () => {
      setError(null);
      setSuggestions(null);
      const result = await getImprovementSuggestions(trendAnalysis);
      if (result.success && result.data) {
        // Split the string by newlines and filter out any empty lines
        const suggestionList = result.data.split('\n').filter(s => s.trim().length > 0 && s.startsWith('-')).map(s => s.substring(1).trim());
        setSuggestions(suggestionList);
      } else {
        setError(result.error || 'Failed to generate suggestions.');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-accent" />
          <span>AI-Powered Improvement Suggestions</span>
        </CardTitle>
        <CardDescription>
          Get actionable strategies from our AI expert to reduce your campus's
          carbon footprint.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isPending && (
          <div className="flex items-center justify-center p-8">
            <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
            <p className="ml-4">Our AI is analyzing the data...</p>
          </div>
        )}
        {suggestions && (
          <div className="p-4 bg-secondary/50 rounded-lg">
             <ul className="list-disc space-y-2 pl-5 text-sm font-sans">
              {suggestions.map((suggestion, index) => (
                <SuggestionItem key={index} text={suggestion} />
              ))}
            </ul>
          </div>
        )}
      </CardContent>
       <CardFooter>
        <Button onClick={handleGenerate} disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Suggestions'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
