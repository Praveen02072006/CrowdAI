import { getCrowdColor } from '../lib/utils';

interface OccupancyBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function OccupancyBar({ percentage, showLabel = true, size = 'md', animate = true }: OccupancyBarProps) {
  const color = getCrowdColor(
    percentage < 50 ? 'LOW' : percentage < 70 ? 'MODERATE' : percentage < 90 ? 'CROWDED' : 'OVERLOADED'
  );

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Occupancy</span>
          <span className="font-bold" style={{ color }}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: `${Math.min(100, percentage)}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}
