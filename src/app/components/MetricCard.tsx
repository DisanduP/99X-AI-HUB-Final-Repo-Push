import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function MetricCard({ title, description, children }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="h-[280px]">
        {children}
      </div>
    </div>
  );
}
