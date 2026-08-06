"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Trash2, Database, KeySquare, CheckCircle2 } from "lucide-react"
import { useKnowledgeDoc } from "@/hooks/useKnowledge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
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
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full p-8 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="md:col-span-1">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !doc) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <h2 className="text-2xl font-semibold mb-2">Document not found</h2>
        <p className="text-muted-foreground mb-6">The knowledge document you are looking for does not exist or failed to load.</p>
        <Button asChild><Link href="/knowledge">Back to Knowledge Base</Link></Button>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-8 bg-muted/10 h-[calc(100vh-4rem)]"
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/knowledge"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">{doc.title}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span className={`uppercase text-xs font-semibold px-2 py-0.5 rounded-full border ${doc.status === 'READY' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-indigo-600 bg-indigo-50 border-indigo-200'}`}>
                {doc.status}
              </span>
              <span>•</span>
              <span>{doc.category || 'Uncategorized'}</span>
            </p>
          </div>
          <div className="md:ml-auto flex gap-2 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none"><RefreshCw className="h-4 w-4 mr-2" /> Re-index</Button>
             <Button variant="destructive" className="flex-1 md:flex-none" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content View */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
               <Database className="h-5 w-5 text-muted-foreground" /> Document Content
            </h3>
            <div className="space-y-4">
              <Card>
                <CardHeader className="py-3 border-b bg-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1"><KeySquare className="h-3 w-3" /> Raw Text</span>
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Synced</span>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <p className="text-sm whitespace-pre-wrap">{doc.content}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Document Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                    <p className="text-sm font-medium">Uploaded</p>
                    <p className="text-xs text-muted-foreground">{new Date(doc.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20 animate-pulse" />
                    <p className="text-sm font-medium">Text Extracted</p>
                    <p className="text-xs text-muted-foreground">Pending vector chunking...</p>
                  </div>
                  <div className="relative opacity-50">
                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-muted ring-4 ring-muted" />
                    <p className="text-sm font-medium">Chunked</p>
                    <p className="text-xs text-muted-foreground">Waiting for extraction...</p>
                  </div>
                  <div className="relative opacity-50">
                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-muted ring-4 ring-muted" />
                    <p className="text-sm font-medium">Embedded & Indexed</p>
                    <p className="text-xs text-muted-foreground">Not available for RAG yet.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
