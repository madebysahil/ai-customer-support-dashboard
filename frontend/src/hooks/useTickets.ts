import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PaginatedResponse } from "./useCustomers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'PENDING_CLIENT' | 'PENDING_INTERNAL' | 'RESOLVED' | 'CLOSED';
  origin: string;
  category: string | null;
  slaBreached: boolean;
  firstResponseSlaBreached: boolean;
  dueDate: string;
  firstResponseAt: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  customer?: any;
  assignedTo?: any;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  authorUser?: any;
  authorCustomer?: any;
}

export function useTickets(params: any = {}) {
  return useQuery<PaginatedResponse<Ticket>>({
    queryKey: ["tickets", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value as string);
      });
      const res = await api.get(`${API_URL}/tickets?${searchParams.toString()}`);
      return res.json();
    },
  });
}

export function useTicket(id: string) {
  return useQuery<{ data: Ticket }>({
    queryKey: ["tickets", id],
    queryFn: async () => {
      const res = await api.get(`${API_URL}/tickets/${id}`);
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Ticket> }) => {
      const res = await api.put(`${API_URL}/tickets/${id}`, data, { method: 'PATCH' });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets", variables.id] });
    },
  });
}

export function useAddTicketComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content, isInternal }: { id: string; content: string; isInternal: boolean }) => {
      const res = await api.post(`${API_URL}/tickets/${id}/comments`, { content, isInternal });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets", variables.id] });
    },
  });
}
