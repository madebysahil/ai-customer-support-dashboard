"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartSkeleton } from './ChartSkeleton';

export interface SentimentDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface SentimentDonutChartProps {
  data: SentimentDataPoint[];
  className?: string;
  height?: number;
}

export function SentimentDonutChart({ data = [], className, height = 280 }: SentimentDonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ChartSkeleton height={height} className={className} title="Sentiment Breakdown" />;
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height: `${height}px` }}
        className={cn("w-full flex items-center justify-center text-xs text-foreground-muted bg-background", className)}
      >
        No sentiment classifications yet.
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
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--surface))',
              borderColor: 'hsl(var(--border-subtle))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))',
              fontSize: '12px'
            }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--foreground-muted))' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
