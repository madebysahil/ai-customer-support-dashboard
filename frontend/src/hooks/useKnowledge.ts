import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export function useKnowledgeDocs(query: string = '', category?: string, status?: string) {
  return useQuery({
    queryKey: ['knowledge', query, category, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      
      const res = await api.get(`/knowledge?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch knowledge documents');
      return res.json() as Promise<{ documents: KnowledgeDocument[], total: number }>;
    }
  });
}

export function useKnowledgeDoc(id: string) {
  return useQuery({
    queryKey: ['knowledge', id],
    queryFn: async () => {
      const res = await api.get(`/knowledge/${id}`);
      if (!res.ok) throw new Error('Failed to fetch knowledge document');
      return res.json() as Promise<KnowledgeDocument>;
    },
    enabled: !!id
  });
}
