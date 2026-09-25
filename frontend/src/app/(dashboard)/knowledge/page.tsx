"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useKnowledgeDocs } from "@/hooks/useKnowledge"
import { Skeleton } from "@/components/ui/skeleton"

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useKnowledgeDocs(search);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'READY': return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
      case 'FAILED': return <AlertCircle className="h-3.5 w-3.5 text-critical" />;
      case 'UPLOADED':
      case 'EXTRACTING':
      case 'CHUNKING':
      case 'EMBEDDING':
      case 'INDEXING':
        return <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />;
      default: return <FileText className="h-3.5 w-3.5 text-foreground-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'READY': return "bg-success/10 text-success border-success/20";
      case 'FAILED': return "bg-critical/10 text-critical border-critical/20";
      default: return "bg-background-subtle text-foreground-muted border-border-subtle";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Knowledge Base</h1>
          <p className="text-sm text-foreground-muted">Manage documents, PDFs, and articles for AI Copilot context.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="hidden md:flex gap-2 bg-surface border-border-subtle hover:bg-background">
            <UploadCloud className="h-4 w-4" /> Bulk Upload
          </Button>
          <Button className="flex-1 md:flex-none gap-2">
            <Plus className="h-4 w-4" /> New Document
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input 
            placeholder="Search documents by title or content..." 
            className="pl-9 bg-surface border-border-subtle"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar shrink-0">
          <Button variant="secondary" size="sm" className="whitespace-nowrap rounded-md bg-background-subtle border border-border-subtle hover:bg-surface">All Docs</Button>
          <Button variant="ghost" size="sm" className="whitespace-nowrap rounded-md text-foreground-muted hover:text-foreground">Policies</Button>
          <Button variant="ghost" size="sm" className="whitespace-nowrap rounded-md text-foreground-muted hover:text-foreground">Technical</Button>
          <Button variant="ghost" size="sm" className="whitespace-nowrap rounded-md text-foreground-muted hover:text-foreground">Guides</Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col border border-border-subtle rounded-md bg-surface p-4 gap-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))
        ) : isError ? (
          <div className="col-span-full p-8 text-center text-critical bg-critical/5 rounded-md border border-critical/20">
            Failed to load documents.
          </div>
        ) : data?.documents.length === 0 ? (
          <div className="col-span-full p-12 text-center text-foreground-muted bg-surface rounded-md border border-dashed border-border-subtle flex flex-col items-center">
            <FileText className="w-8 h-8 mb-4 text-foreground-subtle" />
            <h3 className="font-medium text-sm text-foreground mb-1">No documents found</h3>
            <p className="text-xs">Upload a PDF or create an article to empower the AI Copilot.</p>
          </div>
        ) : (
          data?.documents.map((doc, index) => (
            <Link key={doc.id} href={`/knowledge/${doc.id}`} className="block h-full group animate-slide-up" style={{ animationDelay: `${index < 20 ? index * 50 : 0}ms`, animationFillMode: 'backwards' }}>
              <div className="h-full border border-border-subtle rounded-md p-4 bg-surface hover:border-primary/50 hover:bg-background-subtle transition-colors flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className={`px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 border ${getStatusColor(doc.status)}`}>
                    {getStatusIcon(doc.status)} {doc.status}
                  </div>
                  <div className="text-[10px] font-medium text-foreground-muted bg-background-subtle border border-border-subtle px-1.5 py-0.5 rounded-sm">
                    {doc.category || 'Uncategorized'}
                  </div>
                </div>
                <h3 className="font-medium text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-4 text-foreground flex-1">
                  {doc.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-foreground-muted border-t border-border-subtle pt-3 mt-auto">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud className="h-3 w-3" /> Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
