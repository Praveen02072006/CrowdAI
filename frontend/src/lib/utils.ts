// Crowd level utility functions used throughout the app

export type CrowdLevel = 'LOW' | 'MODERATE' | 'CROWDED' | 'OVERLOADED';

export function getCrowdColor(level: CrowdLevel | string): string {
  switch (level) {
    case 'LOW': return '#10B981';
    case 'MODERATE': return '#F59E0B';
    case 'CROWDED': return '#F97316';
    case 'OVERLOADED': return '#EF4444';
    default: return '#6366f1';
  }
}

export function getCrowdBadgeClass(level: CrowdLevel | string): string {
  switch (level) {
    case 'LOW': return 'badge-crowd-low';
    case 'MODERATE': return 'badge-crowd-moderate';
    case 'CROWDED': return 'badge-crowd-crowded';
    case 'OVERLOADED': return 'badge-crowd-overloaded';
    default: return 'badge-crowd-moderate';
  }
}

export function getCrowdLabel(level: CrowdLevel | string): string {
  switch (level) {
    case 'LOW': return 'Comfortable';
    case 'MODERATE': return 'Moderate';
    case 'CROWDED': return 'Crowded';
    case 'OVERLOADED': return 'Very Crowded';
    default: return 'Unknown';
  }
}

export function getCrowdFromOccupancy(pct: number): CrowdLevel {
  if (pct < 50) return 'LOW';
  if (pct < 70) return 'MODERATE';
  if (pct < 90) return 'CROWDED';
  return 'OVERLOADED';
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

export function getScoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/20';
  if (score >= 50) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}
