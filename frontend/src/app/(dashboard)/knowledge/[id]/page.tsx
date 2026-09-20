"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Trash2, Database, KeySquare, CheckCircle2 } from "lucide-react"
import { useKnowledgeDoc } from "@/hooks/useKnowledge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { useQueryClient } from "@tanstack/react-query"

export default function DocumentDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: doc, isLoading, isError } = useKnowledgeDoc(id as string)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/knowledge/${id}`);
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      router.push('/knowledge');
    } catch (e) {
      console.error(e);
      alert('Failed to delete document');
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center gap-4 border-b border-border-subtle pb-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-48 w-full rounded-md" />
          </div>
          <div className="md:col-span-1">
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !doc) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Document not found</h2>
        <p className="text-sm text-foreground-muted mb-6">The knowledge document you are looking for does not exist or failed to load.</p>
        <Button asChild><Link href="/knowledge">Back to Knowledge Base</Link></Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex items-center gap-4 border-b border-border-subtle pb-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 h-8 w-8 text-foreground-muted hover:text-foreground">
          <Link href="/knowledge"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-foreground truncate">{doc.title}</h1>
          <p className="text-[11px] text-foreground-muted flex items-center gap-2 mt-1">
            <span className={`uppercase font-medium px-1.5 py-0.5 rounded-sm border ${doc.status === 'READY' ? 'text-success bg-success/10 border-success/20' : 'text-primary bg-primary/10 border-primary/20'}`}>
              {doc.status}
            </span>
            <span>•</span>
            <span>{doc.category || 'Uncategorized'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
           <Button variant="outline" size="sm" className="bg-surface border-border-subtle text-foreground hover:bg-background">
             <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Re-index
           </Button>
           <Button variant="outline" size="sm" className="bg-surface border-border-subtle text-critical hover:bg-critical/10 hover:border-critical/30" onClick={handleDelete}>
             <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Main Content View */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
             <Database className="h-4 w-4 text-foreground-muted" /> Document Content
          </h3>
          <div className="bg-surface border border-border-subtle rounded-md overflow-hidden flex flex-col">
            <div className="py-2.5 px-4 border-b border-border-subtle bg-background-subtle">
              <div className="flex items-center justify-between text-[11px] text-foreground-muted font-mono font-medium">
                <span className="flex items-center gap-1.5"><KeySquare className="h-3 w-3" /> Raw Text</span>
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> Synced</span>
                </span>
              </div>
            </div>
            <div className="p-4 text-[13px] text-foreground whitespace-pre-wrap">
              {doc.content}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 bg-surface border border-border-subtle rounded-md flex flex-col">
          <div className="py-3 px-4 border-b border-border-subtle bg-background-subtle">
            <h3 className="text-sm font-semibold text-foreground">Document Pipeline</h3>
          </div>
          <div className="p-5">
            <div className="relative pl-6 border-l border-border-subtle space-y-6">
              <div className="relative">
                <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-success ring-4 ring-success/20" />
                <p className="text-xs font-medium text-foreground">Uploaded</p>
                <p className="text-[10px] text-foreground-muted mt-0.5">{new Date(doc.createdAt).toLocaleString()}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse" />
                <p className="text-xs font-medium text-foreground">Text Extracted</p>
                <p className="text-[10px] text-foreground-muted mt-0.5">Pending vector chunking...</p>
              </div>
              <div className="relative opacity-50">
                <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-border ring-4 ring-border/50" />
                <p className="text-xs font-medium text-foreground">Chunked</p>
                <p className="text-[10px] text-foreground-muted mt-0.5">Waiting for extraction...</p>
              </div>
              <div className="relative opacity-50">
                <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-border ring-4 ring-border/50" />
                <p className="text-xs font-medium text-foreground">Embedded & Indexed</p>
                <p className="text-[10px] text-foreground-muted mt-0.5">Not available for RAG yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
