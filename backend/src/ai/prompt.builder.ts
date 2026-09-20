import { AiMessage } from './provider.interface';

export class PromptBuilder {
  private static CUSTOMER_SUPPORT_PERSONA = `
You are an expert customer support AI for an enterprise SaaS platform.
Be polite, concise, and highly accurate.
Do not hallucinate features. If you do not know the answer, state that you are escalating to a human agent.
Your primary goal is to resolve the user's issue efficiently.
`;

  static buildSupportPrompt(customerContext: any, currentMessage: string): AiMessage[] {
    const contextStr = customerContext.knowledgeContext ? `\n\n${customerContext.knowledgeContext}` : '';
    return [
      {
        role: 'system',
        content: this.CUSTOMER_SUPPORT_PERSONA + contextStr,
      },
      {
        role: 'system',
        content: `Customer Details: ${JSON.stringify({ name: customerContext.name })}`,
      },
      {
        role: 'user',
        content: currentMessage,
      }
    ];
  }

  static buildSuggestionsPrompt(recentContext: string): AiMessage[] {
    return [
      {
        role: 'system',
        content: 'Generate exactly 3 short, distinct, professional suggested replies for the support agent to send. Format as a JSON array of strings: ["reply 1", "reply 2", "reply 3"]. Do not include markdown blocks.',
      },
      {
        role: 'user',
        content: `Context:\n${recentContext}`,
      }
    ];
  }
}
