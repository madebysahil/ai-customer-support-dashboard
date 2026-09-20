import { ticketService } from './ticket.service';
import { chatRepository } from '../repositories/chat.repository';

export class TicketEscalationService {
  async escalateChatToTicket(chatId: string) {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw new Error('Chat not found');

    // 1. Create Ticket
    const ticket = await ticketService.createTicket({
      customerId: chat.customerId,
      originChatId: chatId,
      subject: `Escalation from Chat ${chatId.substring(0, 8)}`,
      description: `Automated escalation due to low AI confidence or explicit request.\nCustomer ID: ${chat.customerId}`,
      priority: 'HIGH',
      status: 'OPEN',
      origin: 'AI_ESCALATION',
      category: 'Support Escalation',
    });

    // 2. Add system note referencing the chat summary
    await ticketService.addComment(
      ticket.id, 
      `Ticket automatically created from chat escalation. Review chat history for context.`, 
      'system', // Mock system user
      true // Internal Note
    );

    return ticket;
  }
}

export const ticketEscalationService = new TicketEscalationService();
