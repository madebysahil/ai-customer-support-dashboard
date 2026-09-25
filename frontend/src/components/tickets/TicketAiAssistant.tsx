"use client";

import React, { useState, useRef, useEffect, memo } from "react"
import { useTicket } from "@/hooks/useTickets"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, StopCircle, CornerDownLeft, RefreshCcw, FileText, Type, Shield, Bot, Send } from "lucide-react"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { getAccessToken } from "@/lib/api"

interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: any
}

const StreamingAiBubble = memo(function StreamingAiBubble({
  content,
  metadata,
}: {
  content: string;
  metadata?: any;
}) {
  return (
    <div className="flex flex-col gap-1 max-w-[90%] mr-auto">
      <div className="text-[10px] font-semibold px-1 text-primary flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Copilot
      </div>
      <div className="p-3 text-[13px] leading-relaxed max-w-none break-words bg-ai-surface border border-ai-border text-foreground rounded-md">
        {content ? (
          <MarkdownRenderer content={content} isStreaming={true} />
        ) : (
          <span className="flex items-center gap-2 text-foreground-muted">
            <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
          </span>
        )}
      </div>
      {metadata?.latencyMs && (
        <div className="text-[9px] text-foreground-muted px-1 opacity-70">
          {(metadata.latencyMs / 1000).toFixed(2)}s • {metadata.model || 'AI'}
        </div>
      )}
    </div>
  );
});

const AiAssistantMessageItem = memo(function AiAssistantMessageItem({ message }: { message: AiMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex flex-col gap-1 max-w-[90%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`text-[10px] font-semibold px-1 ${isUser ? 'text-right text-foreground-muted' : 'text-primary flex items-center gap-1'}`}>
        {!isUser && <Sparkles className="w-3 h-3" />}
        {isUser ? 'You' : 'Copilot'}
      </div>
      <div className={`p-3 text-[13px] leading-relaxed max-w-none break-words ${isUser ? 'bg-primary text-primary-foreground rounded-md' : 'bg-ai-surface border border-ai-border text-foreground rounded-md'}`}>
        <MarkdownRenderer content={message.content} />
      </div>
      {message.metadata?.latencyMs && (
        <div className="text-[9px] text-foreground-muted px-1 opacity-70">
          {(message.metadata.latencyMs / 1000).toFixed(2)}s • {message.metadata.model || 'AI'}
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.role === next.message.role &&
    prev.message.metadata?.latencyMs === next.message.metadata?.latencyMs
  );
});

export function TicketAiAssistant({ activeTicketId }: { activeTicketId: string | null }) {
  const { data: response } = useTicket(activeTicketId || "")
  const ticket = response?.data
  
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [streamingText, setStreamingText] = useState<string | null>(null)
  const [streamingMetadata, setStreamingMetadata] = useState<any>(null)
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clear messages when ticket changes
  useEffect(() => {
    setMessages([])
  }, [activeTicketId])

  if (!activeTicketId || !ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center h-full">
        <div className="bg-ai-surface border border-ai-border text-foreground-muted h-16 w-16 rounded-full flex items-center justify-center mb-6">
          <Bot className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">Copilot Sleeping</h3>
        <p className="text-sm max-w-[250px]">Select a ticket from the inbox to awaken your AI Copilot.</p>
      </div>
    );
  }

  const handleSend = async (content: string, overrideMessages?: AiMessage[]) => {
    if (!content.trim() && !overrideMessages) return;

    const userMessage: AiMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim()
    }

    const currentMessages = overrideMessages || [...messages, userMessage]
    
    if (!overrideMessages) {
      setMessages(currentMessages)
      setInput("")
    }

    const aiMessageId = crypto.randomUUID()
    setStreamingText("")
    setStreamingMetadata(null)
    setIsStreaming(true)

    let streamedContent = ''
    let capturedMetadata: any = null

    try {
      abortControllerRef.current = new AbortController()
      
      const res = await fetch('/api/v1/copilot/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken() || ''}`
        },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
          context: { 
            query: content,
            ticketId: ticket.id,
            ticketSubject: ticket.subject,
            ticketDescription: ticket.description,
            ticketStatus: ticket.status,
            customerName: ticket.customer?.displayName
          }
        }),
        signal: abortControllerRef.current.signal
      })

      if (!res.ok) throw new Error('Network response was not ok')
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader available')
      
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.error) {
                streamedContent = `⚠️ AI Error: ${data.error}`
                setStreamingText(streamedContent)
                break
              }
              if (data.text) {
                streamedContent += data.text
                setStreamingText(streamedContent)
              }
              if (data.metadata) {
                capturedMetadata = data.metadata
                setStreamingMetadata(data.metadata)
              }
            } catch (e) {
              console.error("SSE Parse error:", e)
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Stream error:", error)
        streamedContent = `⚠️ Connection error: ${error.message}`
        setStreamingText(streamedContent)
      }
    } finally {
      if (streamedContent) {
        setMessages(prev => [...prev, { id: aiMessageId, role: 'assistant', content: streamedContent, metadata: capturedMetadata }])
      }
      setStreamingText(null)
      setStreamingMetadata(null)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
    }
  }

  const actionButtons = [
    { label: "Summarize Ticket", icon: <FileText className="w-3 h-3" />, prompt: `Please summarize the entire ticket thread, focusing on the core issue and current status.` },
    { label: "Generate Reply", icon: <CornerDownLeft className="w-3 h-3" />, prompt: `Generate a polite and helpful reply to the customer's last message, aiming to resolve their issue.` },
    { label: "Professional Tone", icon: <Shield className="w-3 h-3" />, prompt: `Rewrite the following draft or provide a response in a highly professional, enterprise-grade tone.` },
    { label: "Empathetic Tone", icon: <Type className="w-3 h-3" />, prompt: `Rewrite the following draft or provide a response in an empathetic, understanding, and warm tone.` },
  ]

  return (
    <div className="flex flex-col h-full bg-surface relative min-w-0">
      {/* Header */}
      <div className="p-3 border-b border-border-subtle bg-surface flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          Copilot
        </h2>
        {isStreaming && (
          <Button variant="ghost" size="sm" onClick={stopStreaming} className="text-critical hover:text-critical hover:bg-critical/10 h-7 px-2 text-xs">
            <StopCircle className="w-3.5 h-3.5 mr-1" /> Stop
          </Button>
        )}
      </div>

      {/* Quick Actions (Contextual AI) */}
      <div className="p-3 border-b border-border-subtle bg-background-subtle overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar shrink-0">
        {actionButtons.map((action, i) => (
          <Button 
            key={i} 
            variant="outline" 
            size="sm" 
            className="text-[11px] h-7 rounded-md border-border-subtle bg-background text-foreground hover:bg-surface shrink-0"
            onClick={() => handleSend(action.prompt)}
            disabled={isStreaming}
          >
            {action.icon} <span className="ml-1.5">{action.label}</span>
          </Button>
        ))}
        {/* Disabled Premium Actions */}
        <Button variant="outline" size="sm" className="text-[11px] h-7 rounded-md opacity-50 cursor-not-allowed shrink-0 bg-background border-border-subtle" title="Requires Backend Support">
          Suggest Priority
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background">
        {messages.length === 0 && streamingText === null ? (
          <div className="text-center p-6 mt-4 border border-dashed border-border-subtle rounded-md bg-background-subtle text-foreground-muted">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-foreground-subtle" />
            <p className="text-[11px]">I&apos;m ready to assist with Ticket <span className="font-mono">{ticket.ticketNumber}</span>. How can I help?</p>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <AiAssistantMessageItem key={m.id} message={m} />
            ))}
            {streamingText !== null && (
              <StreamingAiBubble content={streamingText} metadata={streamingMetadata} />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-surface border-t border-border-subtle shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
          className="relative flex items-end border border-border-subtle rounded-md bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all overflow-hidden"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Ask Copilot..."
            className="w-full min-h-[40px] max-h-[150px] p-2 pr-10 resize-none bg-transparent text-[13px] focus:outline-none"
            disabled={isStreaming}
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost"
            disabled={!input.trim() || isStreaming}
            className="absolute right-1 bottom-1 h-7 w-7 rounded-md text-primary hover:bg-primary/10"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
