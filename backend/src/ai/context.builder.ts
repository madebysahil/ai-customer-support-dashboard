import { Message } from '@prisma/client';
import { AiMessage } from './provider.interface';

export class ContextBuilder {
  private static MAX_HISTORY_MESSAGES = 10;

  static buildHistory(messages: Message[]): AiMessage[] {
    // Sort oldest to newest
    const sorted = [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Truncate to budget
    const truncated = sorted.slice(-this.MAX_HISTORY_MESSAGES);

    return truncated.map(m => ({
      role: m.authorType === 'CUSTOMER' ? 'user' : 'model',
      content: m.content,
    }));
  }

  static formatForSuggestions(messages: Message[]): string {
    const sorted = [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const truncated = sorted.slice(-5);
    return truncated.map(m => `${m.authorType}: ${m.content}`).join('\n');
  }
}
