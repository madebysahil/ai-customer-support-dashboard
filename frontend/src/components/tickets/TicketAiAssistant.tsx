"use client"

import { useState, useRef, useEffect } from "react"
import { useTicket } from "@/hooks/useTickets"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, StopCircle, CornerDownLeft, RefreshCcw, FileText, Type, Shield, Bot, Send } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { getAccessToken } from "@/lib/api"

interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: any
}

export function TicketAiAssistant({ activeTicketId }: { activeTicketId: string | null }) {
  const { data: response } = useTicket(activeTicketId || "")
  const ticket = response?.data
  
  const [messages, setMessages] = useState<AiMessage[]>([])
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
        <div className="bg-indigo-500/10 text-indigo-500 h-16 w-16 rounded-full flex items-center justify-center mb-6">
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
    setMessages(prev => [...prev, { id: aiMessageId, role: 'assistant', content: '' }])
    setIsStreaming(true)

    try {
      abortControllerRef.current = new AbortController()
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/stream`, {
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
      let streamedContent = ''
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
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: streamedContent } : m))
                break
              }
              if (data.text) {
                streamedContent += data.text
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: streamedContent } : m))
              }
              if (data.metadata) {
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, metadata: data.metadata } : m))
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
        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: `⚠️ Connection error: ${error.message}` } : m))
      }
    } finally {
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
    <div className="flex flex-col h-full bg-background relative border-l">
      {/* Header */}
      <div className="p-4 border-b bg-background shadow-sm flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          Copilot
        </h2>
        {isStreaming && (
          <Button variant="ghost" size="sm" onClick={stopStreaming} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2">
            <StopCircle className="w-4 h-4 mr-1" /> Stop
          </Button>
        )}
      </div>

      {/* Quick Actions (Contextual AI) */}
      <div className="p-4 border-b bg-indigo-50/30 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
        {actionButtons.map((action, i) => (
          <Button 
            key={i} 
            variant="outline" 
            size="sm" 
            className="text-xs h-7 rounded-full border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 shrink-0"
            onClick={() => handleSend(action.prompt)}
            disabled={isStreaming}
          >
            {action.icon} <span className="ml-1.5">{action.label}</span>
          </Button>
        ))}
        {/* Disabled Premium Actions */}
        <Button variant="outline" size="sm" className="text-xs h-7 rounded-full opacity-50 cursor-not-allowed shrink-0" title="Requires Backend Support">
          Suggest Priority
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-7 rounded-full opacity-50 cursor-not-allowed shrink-0" title="Requires Backend Support">
          Suggest Category
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-7 rounded-full opacity-50 cursor-not-allowed shrink-0" title="Requires Backend Support">
          Suggest Assignee
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="text-center p-8 mt-8 border border-dashed rounded-xl bg-muted/10 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">I&apos;m ready to assist with Ticket <span className="font-mono">{ticket.ticketNumber}</span>. How can I help?</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex flex-col gap-1 max-w-[90%] ${m.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
              <div className={`text-xs font-semibold px-1 ${m.role === 'user' ? 'text-right text-muted-foreground' : 'text-indigo-600 flex items-center gap-1'}`}>
                {m.role === 'assistant' && <Sparkles className="w-3 h-3" />}
                {m.role === 'user' ? 'You' : 'Copilot'}
              </div>
              <div className={`p-3 text-sm shadow-sm prose prose-sm leading-relaxed max-w-none ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-background border rounded-2xl rounded-tl-sm'}`}>
                {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Thinking...</span>}
              </div>
              {m.metadata?.latencyMs && (
                <div className="text-[10px] text-muted-foreground px-1 opacity-70">
                  {(m.metadata.latencyMs / 1000).toFixed(2)}s • {m.metadata.model || 'AI'}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-background border-t">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
          className="relative flex items-end border rounded-xl bg-muted/20 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all overflow-hidden"
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
            className="w-full min-h-[50px] max-h-[150px] p-3 pr-12 resize-none bg-transparent text-sm focus:outline-none"
            disabled={isStreaming}
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost"
            disabled={!input.trim() || isStreaming}
            className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-full text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
