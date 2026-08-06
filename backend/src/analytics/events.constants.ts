export const AnalyticsEvents = {
  // Business
  TICKET_CREATED: 'ticket_created',
  TICKET_RESOLVED: 'ticket_resolved',
  CHAT_CREATED: 'chat_created',
  
  // AI
  AI_REQUEST: 'ai_request',
  AI_RESPONSE: 'ai_response',
  AI_ESCALATION: 'ai_escalation',
  
  // RAG
  RAG_RETRIEVAL: 'rag_retrieval',
  DOC_INDEXED: 'doc_indexed',
  
  // System
  API_REQUEST: 'api_request',
  SYSTEM_ERROR: 'system_error',
} as const;

export type AnalyticsEventType = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];
