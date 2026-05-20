import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  type?: 'profit' | 'loss' | 'neutral';
  icon?: React.ReactNode;
}

export const StatCard = ({ label, value, subValue, type = 'neutral', icon }: StatCardProps) => (
  <div className="glass-card p-6 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <div className="text-slate-500">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <h3 className={cn(
        "text-2xl font-bold tracking-tight",
        type === 'profit' && "text-emerald-500",
        type === 'loss' && "text-rose-500"
      )}>
        {value}
      </h3>
      {subValue && (
        <span className={cn(
          "text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5",
          type === 'profit' ? "text-emerald-400 bg-emerald-400/10" : 
          type === 'loss' ? "text-rose-400 bg-rose-400/10" : "text-slate-400 bg-slate-400/10"
        )}>
          {type === 'profit' ? <TrendingUp size={12} /> : type === 'loss' ? <TrendingDown size={12} /> : null}
          {subValue}
        </span>
      )}
    </div>
  </div>
);
