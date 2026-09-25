"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartSkeleton } from './ChartSkeleton';

export interface AreaVolumeDataPoint {
  time: string;
  volume: number;
  aiResolved: number;
}

export interface AreaVolumeChartProps {
  data: AreaVolumeDataPoint[];
  className?: string;
  height?: number;
}

export function AreaVolumeChart({ data = [], className, height = 280 }: AreaVolumeChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ChartSkeleton height={height} className={className} title="Conversation Volume" />;
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height: `${height}px` }}
        className={cn("w-full flex items-center justify-center text-xs text-foreground-muted bg-background", className)}
      >
        No volume activity recorded today.
      </div>
    );
  }

  return (
    <div style={{ height: `${height}px` }} className={cn("w-full bg-background p-4 pr-6", className)}>
      <ResponsiveContainer width="100%" height="100%" minHeight={height - 32} debounce={50}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="ingressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--foreground-muted))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--foreground-muted))" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="aiResolvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border-subtle))" />
          <XAxis dataKey="time" stroke="hsl(var(--foreground-muted))" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--foreground-muted))" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--surface))',
              borderColor: 'hsl(var(--border-subtle))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))',
              fontSize: '12px'
            }}
          />
          <Legend verticalAlign="top" height={30} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
          <Area type="monotone" name="Inbound Ingress" dataKey="volume" stroke="hsl(var(--foreground-muted))" fill="url(#ingressGrad)" strokeWidth={1.5} />
          <Area type="monotone" name="AI Autonomous Resolution" dataKey="aiResolved" stroke="hsl(var(--primary))" fill="url(#aiResolvedGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
