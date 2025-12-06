import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import type { FC } from 'react';

interface EmissionsSummaryCardProps {
  title: string;
  value: number;
  unit: string;
  description: string;
  icon: LucideIcon;
}

const EmissionsSummaryCard: FC<EmissionsSummaryCardProps> = ({
  title,
  value,
  unit,
  description,
  icon: Icon,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString()} {unit}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default EmissionsSummaryCard;
