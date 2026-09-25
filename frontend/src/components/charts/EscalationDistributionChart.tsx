"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartSkeleton } from './ChartSkeleton';

export interface EscalationPriorityDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface EscalationDistributionChartProps {
  data: EscalationPriorityDataPoint[];
  className?: string;
  height?: number;
}

const PALETTE = [
  'hsl(var(--critical))',
  'hsl(var(--warning))',
  'hsl(var(--info))',
  'hsl(var(--foreground-muted))'
];

export function EscalationDistributionChart({ data = [], className, height = 300 }: EscalationDistributionChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ChartSkeleton height={height} className={className} title="Escalation Distribution" />;
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height: `${height}px` }}
        className={cn("w-full flex items-center justify-center text-xs text-foreground-muted bg-background", className)}
      >
        No escalation distribution data available.
      </div>
    );
  }

  return (
    <div style={{ height: `${height}px` }} className={cn("w-full bg-background p-4", className)}>
      <ResponsiveContainer width="100%" height="100%" minHeight={height - 32} debounce={50}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--surface))',
              borderColor: 'hsl(var(--border-subtle))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground-muted))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
