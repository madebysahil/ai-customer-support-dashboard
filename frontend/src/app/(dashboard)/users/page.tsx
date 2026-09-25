"use client";

import { useState, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Shield, Users, Key, Activity, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { useVirtualizer } from "@tanstack/react-virtual"

function AuditLogVirtualTable({ logs, auditLoading }: { logs: any[]; auditLoading: boolean }) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const auditVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 8,
    enabled: logs.length > 0,
  });

  const virtualItems = auditVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0
    ? auditVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  if (auditLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
      </div>
    );
  }

  return (
    <div ref={tableContainerRef} className="max-h-[560px] overflow-auto border-b">
      <Table>
        <TableHeader className="sticky top-0 bg-background-subtle z-10 shadow-sm">
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <tr>
              <td colSpan={4} style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const log = logs[virtualRow.index];
            return (
              <TableRow
                key={log.id}
                ref={auditVirtualizer.measureElement}
                data-index={virtualRow.index}
              >
                <TableCell className="text-xs text-foreground-muted whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.executedAt), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-sm font-medium">{log.actor?.fullName || 'System'}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                    log.action.includes('Modif') || log.action.includes('Updat') 
                      ? 'border-warning/30 text-warning bg-warning/10' 
                      : 'border-info/30 text-info bg-info/10'
                  }`}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-foreground-muted">
                  {log.resourceType}: {log.resourceId} {log.newState ? JSON.stringify(log.newState) : ''}
                </TableCell>
              </TableRow>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td colSpan={4} style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users')

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.json();
    },
    enabled: user?.role === 'ADMINISTRATOR'
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await api.get('/audit-logs');
      return res.json();
    },
    enabled: user?.role === 'ADMINISTRATOR' && activeTab === 'audit'
  });

  if (authLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-foreground-muted" /></div>;
  }

  if (user?.role !== 'ADMINISTRATOR' && user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center">
        <Shield className="w-12 h-12 text-critical opacity-50" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-sm">You must have the ADMINISTRATOR role to view staff management and audit logs.</p>
      </div>
    )
  }

  const staff = usersData?.data || [];
  const logs = auditData?.data || [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">User Management & Audit</h1>
          <p className="text-sm text-foreground-muted">Manage staff roles and view immutable audit logs.</p>
        </div>
        <div className="flex bg-background-subtle p-0.5 rounded-md border border-border-subtle shrink-0">
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-4 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${activeTab === 'users' ? 'bg-surface shadow-sm text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
          >
            Staff & Roles
          </button>
          <button 
            onClick={() => setActiveTab('audit')} 
            className={`px-4 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${activeTab === 'audit' ? 'bg-surface shadow-sm text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-surface border border-border-subtle rounded-md flex flex-col">
          <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-background-subtle">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4" /> Active Staff</h3>
            <Button size="sm" className="h-8 text-xs">Onboard User</Button>
          </div>
          {usersLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-foreground-muted" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-sm">
                      {u.fullName}
                      <span className="block text-xs text-foreground-muted">{u.email}</span>
                    </TableCell>
                    <TableCell>
                      {u.role === 'ADMINISTRATOR' ? (
                        <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] uppercase font-bold">Administrator</span>
                      ) : (
                        <span className="px-2 py-1 bg-surface-raised border border-border-subtle rounded text-[10px] uppercase font-bold text-foreground-muted">Support Agent</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={u.availabilityStatus === 'ONLINE' ? "text-success text-xs" : "text-foreground-muted text-xs"}>
                        {u.availabilityStatus === 'ONLINE' ? 'Active' : 'Offline'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-[10px]"><Key className="w-3 h-3 mr-1" /> Reset Creds</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-border-subtle rounded-md flex flex-col">
          <div className="p-4 border-b border-border-subtle bg-background-subtle">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Immutable Audit Log</h3>
          </div>
          <AuditLogVirtualTable logs={logs} auditLoading={auditLoading} />
        </div>
      )}
    </div>
  )
}
