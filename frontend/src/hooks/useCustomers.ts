import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface Customer {
  id: string;
  email: string;
  displayName: string;
  companyName: string | null;
  phoneNumber: string | null;
  csatAverage: string | number | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function useCustomers(params: any = {}) {
  return useQuery<PaginatedResponse<Customer>>({
    queryKey: ["customers", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value as string);
      });
      const res = await api.get(`${API_URL}/customers?${searchParams.toString()}`);
      return res.json();
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ["customers", id],
    queryFn: async () => {
      const res = await api.get(`${API_URL}/customers/${id}`);
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      const res = await api.post(`${API_URL}/customers`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      const res = await api.put(`${API_URL}/customers/${id}`, data, { method: 'PATCH' }); // using fetch wrapper overriding method to PATCH
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${API_URL}/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
