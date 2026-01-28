import { AgentStatus } from '@/app/types';
import { Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: AgentStatus;
  showLabel?: boolean;
}

export function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  const config = {
    healthy: {
      color: 'text-green-600',
      bg: 'bg-green-50',
      label: 'Healthy'
    },
    degraded: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      label: 'Degraded'
    },
    failed: {
      color: 'text-red-600',
      bg: 'bg-red-50',
      label: 'Failed'
    }
  };

  const { color, bg, label } = config[status];

  if (!showLabel) {
    return <Circle className={`w-2 h-2 fill-current ${color}`} />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
      <Circle className="w-2 h-2 fill-current" />
      {label}
    </span>
  );
}
