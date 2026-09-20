import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Demo Users
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=ffdfbf' },
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      fullName: 'System Administrator',
      role: 'ADMINISTRATOR',
      availabilityStatus: 'ONLINE',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=ffdfbf',
    },
  });
  console.log('✅ Admin user seeded.');

  const agentPasswordHash = await bcrypt.hash('Agent@123', 12);
  const agent = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: { avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent&backgroundColor=b6e3f4' },
    create: {
      email: 'agent@example.com',
      passwordHash: agentPasswordHash,
      fullName: 'Support Agent',
      role: 'SUPPORT_AGENT',
      availabilityStatus: 'ONLINE',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent&backgroundColor=b6e3f4',
    },
  });
  console.log('✅ Agent user seeded.');

  // 2. Create Customers
  const customersData = [
    { email: 'john@acmecorp.com', displayName: 'John Doe', companyName: 'Acme Corp', phoneNumber: '555-0100', csatAverage: 4.5, metadata: { tier: 'Premium' } },
    { email: 'jane@starkinds.com', displayName: 'Jane Smith', companyName: 'Stark Industries', phoneNumber: '555-0101', csatAverage: 5.0, metadata: { tier: 'Enterprise' } },
    { email: 'bob@globex.com', displayName: 'Bob Vance', companyName: 'Globex Corp', phoneNumber: '555-0102', csatAverage: 3.2, metadata: { tier: 'Standard' } },
    { email: 'alice@wayneent.com', displayName: 'Alice Liddell', companyName: 'Wayne Enterprises', phoneNumber: '555-0103', csatAverage: 4.8, metadata: { tier: 'Enterprise' } },
    { email: 'charlie@wonka.com', displayName: 'Charlie Bucket', companyName: 'Wonka Inc', phoneNumber: '555-0104', csatAverage: 2.5, metadata: { tier: 'Basic' } },
  ];

  const customers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: c,
    });
    customers.push(cust);
  }
  console.log(`✅ Seeded ${customers.length} customers.`);

  // 3. Create Knowledge Documents
  const kb1 = await prisma.knowledgeDocument.create({
    data: {
      title: 'Return and Refund Policy',
      originalFileName: 'returns_policy_v2.pdf',
      mimeType: 'application/pdf',
      status: 'READY',
      category: 'Policies',
      tags: ['returns', 'refunds', 'shipping'],
      authorId: admin.id,
    }
  });
  const kb2 = await prisma.knowledgeDocument.create({
    data: {
      title: 'API Authentication Guide',
      originalFileName: 'api_auth_guide.md',
      mimeType: 'text/markdown',
      status: 'READY',
      category: 'Technical Integration',
      tags: ['api', 'authentication', 'oauth'],
      authorId: agent.id,
    }
  });
  console.log('✅ Seeded Knowledge Documents.');

  // 4. Create Chats and Messages
  const chat1 = await prisma.chat.create({
    data: {
      customerId: customers[0].id,
      assignedAgentId: agent.id,
      status: 'IN_PROGRESS',
      channelOrigin: 'WEB_WIDGET',
      messages: {
        create: [
          { authorType: 'CUSTOMER', authorId: customers[0].id, content: 'Hi, I need help with my recent order #99281.', isRead: true },
          { authorType: 'AI_ASSISTANT', authorId: 'system', content: 'Hello John! I see your order #99281 is currently in transit. Can I help you with anything specific about it?', isRead: true },
          { authorType: 'CUSTOMER', authorId: customers[0].id, content: 'Yes, the shipping address is wrong.', isRead: true },
          { authorType: 'SUPPORT_AGENT', authorId: agent.id, content: 'I can help you update that address right now. What should it be?', isRead: false },
        ]
      }
    }
  });

  const chat2 = await prisma.chat.create({
    data: {
      customerId: customers[1].id,
      status: 'AI_HANDLED',
      channelOrigin: 'WEB_WIDGET',
      closedAt: new Date(),
      messages: {
        create: [
          { authorType: 'CUSTOMER', authorId: customers[1].id, content: 'Where can I find the API documentation?', isRead: true },
          { authorType: 'AI_ASSISTANT', authorId: 'system', content: 'You can find our full API documentation at https://docs.example.com. Let me know if you need help finding a specific endpoint.', isRead: true },
        ]
      }
    }
  });
  console.log('✅ Seeded Chats and Messages.');

  // 5. Create Tickets
  await prisma.ticket.upsert({
    where: { ticketNumber: 'TKT-1001' },
    update: {},
    create: {
      ticketNumber: 'TKT-1001',
      customerId: customers[0].id,
      assignedToId: agent.id,
      subject: 'Update shipping address for Order #99281',
      description: 'Customer needs to update shipping address before dispatch.',
      priority: 'HIGH',
      status: 'OPEN',
      category: 'Shipping',
      origin: 'AI_ESCALATION',
      originChatId: chat1.id,
      dueDate: new Date(Date.now() + 86400000), // +1 day
      comments: {
        create: [
          { content: 'Escalated from chat because address change requires manual intervention.', isInternal: true, authorUserId: admin.id }
        ]
      }
    }
  });

  await prisma.ticket.upsert({
    where: { ticketNumber: 'TKT-1002' },
    update: {},
    create: {
      ticketNumber: 'TKT-1002',
      customerId: customers[2].id,
      subject: 'Login issues on mobile app',
      description: 'Cannot login using SSO on iOS app version 2.4.1',
      priority: 'MEDIUM',
      status: 'PENDING_INTERNAL',
      category: 'Technical Support',
      origin: 'CUSTOMER_REQUEST',
      dueDate: new Date(Date.now() + 172800000), // +2 days
    }
  });
  console.log('✅ Seeded Tickets.');

  // 6. Create Notifications
  await prisma.notification.createMany({
    data: [
      { recipientId: agent.id, title: 'New Ticket Assigned', message: 'TKT-1001 has been assigned to you.', priorityTier: 'INFO', isRead: false },
      { recipientId: agent.id, title: 'SLA Warning', message: 'TKT-1002 is approaching SLA breach.', priorityTier: 'WARNING', isRead: false },
      { recipientId: admin.id, title: 'System Update', message: 'Maintenance scheduled for tonight at 2AM UTC.', priorityTier: 'INFO', isRead: true },
    ]
  });
  console.log('✅ Seeded Notifications.');

  // 7. Create Analytics Events
  const events = [];
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const isEscalation = Math.random() > 0.8; // 20% escalation rate
    const recordedAt = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    if (isEscalation) {
      events.push({
        eventType: 'AI_ESCALATION',
        metricVal: Math.random() * 0.5 + 0.1, // Low confidence
        dimensions: { reason: 'confidence_threshold', priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] },
        recordedAt
      });
    } else {
      events.push({
        eventType: 'AI_RESPONSE',
        metricVal: Math.random() * 0.2 + 0.8, // High confidence 0.8-1.0
        dimensions: { tokens: Math.floor(Math.random() * 100) + 50 },
        recordedAt
      });
    }
  }
  await prisma.analyticsEvent.createMany({ data: events });
  console.log(`✅ Seeded ${events.length} Analytics Events.`);

  // 8. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { actorId: admin.id, action: 'Role Updated', resourceType: 'User', resourceId: agent.id, previousState: { role: 'SUPPORT_AGENT' }, newState: { role: 'SUPPORT_AGENT' }, ipAddress: '192.168.1.1' },
      { actorId: null, action: 'Settings Modified', resourceType: 'SystemSetting', resourceId: 'ai.confidence_threshold', newState: { value: 0.85 }, ipAddress: '127.0.0.1' },
    ]
  });
  console.log('✅ Seeded Audit Logs.');

}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
