"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartSkeleton } from './ChartSkeleton';

export interface TokenUsageDataPoint {
  date: string;
  tokens: number;
}

export interface TokenUsageChartProps {
  data: TokenUsageDataPoint[];
  className?: string;
  height?: number;
}

export function TokenUsageChart({ data = [], className, height = 300 }: TokenUsageChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ChartSkeleton height={height} className={className} title="Token Usage" />;
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height: `${height}px` }}
        className={cn("w-full flex items-center justify-center text-xs text-foreground-muted bg-background", className)}
      >
        No token usage data available for this range.
      </div>
    );
  }

  return (
    <div style={{ height: `${height}px` }} className={cn("w-full bg-background p-4 pr-8", className)}>
      <ResponsiveContainer width="100%" height="100%" minHeight={height - 32} debounce={50}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border-subtle))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--foreground-muted))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--foreground-muted))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
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
          <Area
            type="monotone"
            dataKey="tokens"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
