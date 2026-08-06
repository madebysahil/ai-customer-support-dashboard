"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Trash2, Database, KeySquare, CheckCircle2 } from "lucide-react"

export default function DocumentDetailsPage() {
  const { id } = useParams()
  // Mock data for UI layout
  const doc = {
    id,
    title: 'Refund Policy 2024.pdf',
    status: 'READY',
    category: 'Policies',
    chunks: [
      { id: 'c1', content: 'Our refund policy allows for a 30-day money-back guarantee on all enterprise plans...', tokens: 18, embeddingModel: 'text-embedding-004' },
      { id: 'c2', content: 'Refunds requested after 30 days are subject to a 15% processing fee unless waived by an executive...', tokens: 22, embeddingModel: 'text-embedding-004' },
    ]
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/knowledge"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{doc.title}</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <span className="uppercase text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {doc.status}
            </span>
            <span>•</span>
            <span>{doc.category}</span>
          </p>
        </div>
        <div className="ml-auto flex gap-2">
           <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Re-index</Button>
           <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Chunks View */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
             <Database className="h-5 w-5 text-muted-foreground" /> Document Vectors ({doc.chunks.length})
          </h3>
          <div className="space-y-4">
            {doc.chunks.map((chunk) => (
              <Card key={chunk.id}>
                <CardHeader className="py-3 border-b bg-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1"><KeySquare className="h-3 w-3" /> {chunk.id}</span>
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Embedded ({chunk.embeddingModel})</span>
                      <span className="bg-muted px-2 py-0.5 rounded-md text-foreground">{chunk.tokens} tokens</span>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <p className="text-sm">{chunk.content}</p>
                </CardContent>
              </Card>
            ))}
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
                  <p className="text-xs text-muted-foreground">Oct 12, 10:00 AM</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  <p className="text-sm font-medium">Text Extracted</p>
                  <p className="text-xs text-muted-foreground">12 pages parsed</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  <p className="text-sm font-medium">Chunked</p>
                  <p className="text-xs text-muted-foreground">Strategy: Fixed (1000 tokens)</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  <p className="text-sm font-medium">Embedded & Indexed</p>
                  <p className="text-xs text-muted-foreground">Available for RAG retrieval.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
