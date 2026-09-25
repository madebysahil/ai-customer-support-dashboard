import dynamic from 'next/dynamic';
import React from 'react';
import { ChartSkeleton } from './ChartSkeleton';

export const DynamicTokenUsageChart = dynamic(
  () => import('./TokenUsageChart').then((m) => m.TokenUsageChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={300} title="Token Usage" />,
  }
);

export const DynamicEscalationDistributionChart = dynamic(
  () => import('./EscalationDistributionChart').then((m) => m.EscalationDistributionChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={300} title="Escalation Distribution" />,
  }
);

export const DynamicAreaVolumeChart = dynamic(
  () => import('./AreaVolumeChart').then((m) => m.AreaVolumeChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={280} title="Conversation Volume" />,
  }
);

export const DynamicSentimentDonutChart = dynamic(
  () => import('./SentimentDonutChart').then((m) => m.SentimentDonutChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={280} title="Sentiment Breakdown" />,
  }
);

export { ChartSkeleton };
