import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAiMetrics(days: number = 30, refreshIntervalMs: number = 60000) {
  return useQuery({
    queryKey: ["analytics", "ai", days],
    queryFn: async () => {
      const res = await api.get(`/analytics/ai?days=${days}`);
      return res.json();
    },
    // Configurable refresh interval for near real-time dashboards
    refetchInterval: refreshIntervalMs, 
  });
}
