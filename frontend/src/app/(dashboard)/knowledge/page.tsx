"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useKnowledgeDocs } from "@/hooks/useKnowledge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useKnowledgeDocs(search);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'READY': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'FAILED': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'UPLOADED':
      case 'EXTRACTING':
      case 'CHUNKING':
      case 'EMBEDDING':
      case 'INDEXING':
        return <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'READY': return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'FAILED': return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-muted/10 h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Knowledge Base</h1>
            <p className="text-muted-foreground">Manage documents, PDFs, and articles for AI Copilot context.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="hidden md:flex gap-2">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents by title or content..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <Button variant="secondary" size="sm" className="whitespace-nowrap rounded-full">All Docs</Button>
            <Button variant="ghost" size="sm" className="whitespace-nowrap rounded-full">Policies</Button>
            <Button variant="ghost" size="sm" className="whitespace-nowrap rounded-full">Technical</Button>
            <Button variant="ghost" size="sm" className="whitespace-nowrap rounded-full">Guides</Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="h-full border shadow-sm">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : isError ? (
              <div className="col-span-full p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                Failed to load documents.
              </div>
            ) : data?.documents.length === 0 ? (
              <div className="col-span-full p-12 text-center text-muted-foreground bg-background rounded-xl border border-dashed flex flex-col items-center">
                <FileText className="w-12 h-12 mb-4 text-muted-foreground/30" />
                <h3 className="font-semibold text-lg text-foreground mb-1">No documents found</h3>
                <p>Upload a PDF or create an article to empower the AI Copilot.</p>
              </div>
            ) : (
              data?.documents.map((doc, idx) => (
                <motion.div 
                  key={doc.id} 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Link href={`/knowledge/${doc.id}`} className="block h-full group">
                    <Card className="h-full hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer bg-background overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)} {doc.status}
                          </div>
                          <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                            {doc.category || 'Uncategorized'}
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2 text-lg leading-tight group-hover:text-indigo-700 transition-colors">{doc.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                          <span className="flex items-center gap-1">
                            <UploadCloud className="h-3.5 w-3.5" /> Updated {new Date(doc.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
