import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export function useAiMetrics(days: number = 30, refreshIntervalMs: number = 60000) {
  return useQuery({
    queryKey: ["analytics", "ai", days],
    queryFn: async () => {
      const res = await api.get(`${API_URL}/analytics/ai?days=${days}`);
      return res.json();
    },
    // Configurable refresh interval for near real-time dashboards
    refetchInterval: refreshIntervalMs, 
  });
}
