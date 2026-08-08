import { getCrowdBadgeClass, getCrowdLabel } from '../lib/utils';

interface CrowdBadgeProps {
  level: string;
  size?: 'sm' | 'md';
}

export default function CrowdBadge({ level, size = 'md' }: CrowdBadgeProps) {
  const badgeClass = getCrowdBadgeClass(level);
  const label = getCrowdLabel(level);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold border ${badgeClass} ${
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    }`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      {label}
    </span>
  );
}
