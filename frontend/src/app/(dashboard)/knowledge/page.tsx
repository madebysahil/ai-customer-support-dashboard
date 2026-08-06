"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

// Mock fetch Hook placeholder (assume standard useQuery)
const mockDocs = [
  { id: '1', title: 'Refund Policy 2024', status: 'READY', chunks: 14, updatedAt: new Date().toISOString() },
  { id: '2', title: 'API Integration Guide', status: 'INDEXING', chunks: 85, updatedAt: new Date().toISOString() },
  { id: '3', title: 'SLA Terms (Enterprise)', status: 'FAILED', chunks: 0, updatedAt: new Date().toISOString() },
];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");

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
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">Manage documents that feed context into the AI Assistant.</p>
        </div>
        <Button>
          <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents by title or content..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockDocs.map(doc => (
              <Card key={doc.id} className="hover:border-indigo-500/50 transition-colors cursor-pointer group">
                <Link href={`/knowledge/${doc.id}`}>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                        <CardTitle className="text-base font-semibold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {doc.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 text-sm text-muted-foreground flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium">
                      {getStatusIcon(doc.status)}
                      <span className={doc.status === 'READY' ? 'text-emerald-600' : doc.status === 'FAILED' ? 'text-red-600' : 'text-indigo-600'}>
                        {doc.status}
                      </span>
                    </div>
                    <span>{doc.chunks} chunks</span>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
