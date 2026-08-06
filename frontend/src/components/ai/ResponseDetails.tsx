import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Search, ChevronDown, ChevronRight } from "lucide-react";
import { AiMessage } from "@/services/aiStorage.service";

export function ResponseDetails({ metadata, timestamp }: { metadata?: AiMessage['metadata'], timestamp?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!metadata) return null;

  return (
    <div className="mt-2 text-xs">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Response Details
      </button>
      
      {isOpen && (
        <Card className="mt-2 p-3 bg-muted/30 flex flex-col gap-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Brain className="h-3.5 w-3.5" />
              <span>Model: <span className="font-medium text-foreground">{metadata.model || 'Unknown'}</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Latency: <span className="font-medium text-foreground">{metadata.latency ? `${metadata.latency}ms` : 'N/A'}</span></span>
            </div>
            {metadata.confidenceScore !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium">Confidence:</span>
                <Badge variant={metadata.confidenceScore > 0.8 ? 'default' : 'secondary'} className="h-5 text-[10px]">
                  {Math.round(metadata.confidenceScore * 100)}%
                </Badge>
              </div>
            )}
            {metadata.tokenUsage !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium">Tokens:</span>
                <span className="text-foreground">{metadata.tokenUsage}</span>
              </div>
            )}
            {timestamp && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium">Time:</span>
                <span className="text-foreground">{new Date(timestamp).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          
          {metadata.citations && metadata.citations.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t pt-2">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Search className="h-3.5 w-3.5" />
                <span className="font-medium">Retrieved Knowledge:</span>
              </div>
              {metadata.citations.map((cite, i) => (
                <div key={i} className="pl-5 relative text-muted-foreground text-[11px] italic">
                  <div className="absolute left-1.5 top-1.5 w-1 h-1 rounded-full bg-primary/50" />
                  &quot;{cite.contentSnippet}&quot; <span className="font-semibold text-foreground/70">(Source {i + 1})</span>
                  {cite.score && <span className="ml-2 text-success/80 font-mono">[{Math.round(cite.score * 100)}%]</span>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
