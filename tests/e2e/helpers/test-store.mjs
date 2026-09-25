// tests/e2e/helpers/test-store.mjs
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const TEST_IDS = {
  adminUser: '11111111-1111-1111-1111-111111111111',
  agentUser: '22222222-2222-2222-2222-222222222222',
  customer1: '33333333-3333-3333-3333-333333333331',
  customer2: '33333333-3333-3333-3333-333333333332',
  ticket1: '44444444-4444-4444-4444-444444444441',
  ticket2: '44444444-4444-4444-4444-444444444442',
  chat1: '55555555-5555-5555-5555-555555555551',
  kb1: '66666666-6666-6666-6666-666666666661'
};

export function createInitialData() {
  const adminPasswordHash = bcrypt.hashSync('Password123!', 10);
  const agentPasswordHash = bcrypt.hashSync('Password123!', 10);

  const users = [
    {
      id: TEST_IDS.adminUser,
      email: 'admin@example.com',
      fullName: 'System Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMINISTRATOR',
      availabilityStatus: 'ONLINE',
      avatarUrl: '/avatars/admin.png',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z')
    },
    {
      id: TEST_IDS.agentUser,
      email: 'agent@example.com',
      fullName: 'Support Agent Jane',
      passwordHash: agentPasswordHash,
      role: 'SUPPORT_AGENT',
      availabilityStatus: 'ONLINE',
      avatarUrl: '/avatars/agent.png',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z')
    }
  ];

  const customers = [
    {
      id: TEST_IDS.customer1,
      email: 'customer@acme.com',
      displayName: 'Alice Johnson',
      companyName: 'Acme Corp',
      phoneNumber: '+1-555-0100',
      csatAverage: 4.8,
      metadata: { tier: 'ENTERPRISE', plan: 'Unlimited' },
      createdAt: new Date('2026-02-01T00:00:00Z'),
      updatedAt: new Date('2026-02-01T00:00:00Z'),
      deletedAt: null
    },
    {
      id: TEST_IDS.customer2,
      email: 'bob@techflow.io',
      displayName: 'Bob Smith',
      companyName: 'TechFlow Inc',
      phoneNumber: '+1-555-0200',
      csatAverage: 4.5,
      metadata: { tier: 'GROWTH' },
      createdAt: new Date('2026-02-15T00:00:00Z'),
      updatedAt: new Date('2026-02-15T00:00:00Z'),
      deletedAt: null
    }
  ];

  const tickets = [
    {
      id: TEST_IDS.ticket1,
      customerId: TEST_IDS.customer1,
      assignedToId: TEST_IDS.agentUser,
      originChatId: null,
      ticketNumber: 'SP-1001',
      subject: 'Critical API Outage in Production',
      description: 'Webhook delivery returned 502 Bad Gateway for 15 consecutive minutes.',
      priority: 'URGENT',
      status: 'OPEN',
      origin: 'MANUAL',
      category: 'API_INTEGRATION',
      slaBreached: false,
      firstResponseSlaBreached: false,
      dueDate: new Date(Date.now() + 3600 * 1000 * 4),
      firstResponseAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
      deletedAt: null
    },
    {
      id: TEST_IDS.ticket2,
      customerId: TEST_IDS.customer2,
      assignedToId: TEST_IDS.adminUser,
      originChatId: null,
      ticketNumber: 'SP-1002',
      subject: 'Billing Invoice Discrepancy',
      description: 'Invoice #492 shows unexpected surcharge on seat expansion.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      origin: 'CUSTOMER_REQUEST',
      category: 'BILLING',
      slaBreached: false,
      firstResponseSlaBreached: false,
      dueDate: new Date(Date.now() + 3600 * 1000 * 24),
      firstResponseAt: new Date(Date.now() - 3600 * 1000),
      createdAt: new Date(Date.now() - 7200 * 1000),
      updatedAt: new Date(),
      resolvedAt: new Date(),
      deletedAt: null
    }
  ];

  const comments = [
    {
      id: crypto.randomUUID(),
      ticketId: TEST_IDS.ticket1,
      content: 'Investigating network gateway ingress logs.',
      isInternal: true,
      authorUserId: TEST_IDS.agentUser,
      authorCustomerId: null,
      createdAt: new Date()
    }
  ];

  const knowledgeDocuments = [
    {
      id: TEST_IDS.kb1,
      title: 'Configuring SSO with SAML & Okta',
      originalFileName: 'okta-sso-guide.md',
      mimeType: 'text/markdown',
      status: 'READY',
      category: 'AUTHENTICATION',
      tags: ['sso', 'okta', 'security'],
      authorId: TEST_IDS.adminUser,
      metadata: { readingTimeMinutes: 5 },
      createdAt: new Date('2026-03-01T00:00:00Z'),
      updatedAt: new Date('2026-03-01T00:00:00Z'),
      chunks: [{ id: crypto.randomUUID(), content: 'Configuring SSO with SAML & Okta instructions' }]
    }
  ];

  const notifications = [
    {
      id: crypto.randomUUID(),
      recipientId: TEST_IDS.agentUser,
      title: 'Urgent Ticket Assigned',
      message: 'Ticket SP-1001 requires immediate triage.',
      priorityTier: 'CRITICAL',
      linkUrl: `/tickets/${TEST_IDS.ticket1}`,
      isRead: false,
      expiresAt: null,
      createdAt: new Date()
    }
  ];

  const systemSettings = [
    {
      configKey: 'app.name',
      configValue: 'SupportPilot Enterprise',
      description: 'Application branding title',
      isSensitive: false,
      updatedById: TEST_IDS.adminUser,
      updatedAt: new Date()
    },
    {
      configKey: 'ai.confidence_threshold',
      configValue: 0.85,
      description: 'Threshold for autonomous resolution',
      isSensitive: false,
      updatedById: TEST_IDS.adminUser,
      updatedAt: new Date()
    }
  ];

  const auditLogs = [
    {
      id: crypto.randomUUID(),
      actorId: TEST_IDS.adminUser,
      action: 'System Initialized',
      resourceType: 'System',
      resourceId: 'root',
      previousState: null,
      newState: { status: 'INITIALIZED' },
      ipAddress: '127.0.0.1',
      userAgent: 'Automated-Test-Runner',
      executedAt: new Date()
    }
  ];

  const chats = [
    {
      id: TEST_IDS.chat1,
      customerId: TEST_IDS.customer1,
      assignedAgentId: TEST_IDS.agentUser,
      status: 'IN_PROGRESS',
      channelOrigin: 'WEB_WIDGET',
      currentSentiment: 0.8,
      escalationTriggered: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      closedAt: null
    }
  ];

  const messages = [
    {
      id: crypto.randomUUID(),
      chatId: TEST_IDS.chat1,
      authorType: 'CUSTOMER',
      authorId: TEST_IDS.customer1,
      content: 'Hello, need assistance with webhooks.',
      sentimentScore: 0.8,
      isRead: true,
      readAt: new Date(),
      metadata: null,
      createdAt: new Date(),
      deletedAt: null
    }
  ];

  const sessions = [];

  return {
    users,
    customers,
    tickets,
    comments,
    knowledgeDocuments,
    notifications,
    systemSettings,
    auditLogs,
    chats,
    messages,
    sessions
  };
}

export function createMockPrisma(store) {
  return {
    $connect: async () => {},
    $disconnect: async () => {},
    $queryRaw: async () => [{ max_num: store.tickets.length }],
    user: {
      findUnique: async ({ where }) => {
        return store.users.find(u => (where.id && u.id === where.id) || (where.email && u.email.toLowerCase() === where.email.toLowerCase())) || null;
      },
      findMany: async (args = {}) => {
        let result = [...store.users];
        if (args.where?.role) result = result.filter(u => u.role === args.where.role);
        return result;
      },
      create: async ({ data }) => {
        const user = { id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        store.users.push(user);
        return user;
      },
      update: async ({ where, data }) => {
        const idx = store.users.findIndex(u => u.id === where.id);
        if (idx === -1) throw new Error('User not found');
        store.users[idx] = { ...store.users[idx], ...data, updatedAt: new Date() };
        return store.users[idx];
      }
    },
    session: {
      create: async ({ data }) => {
        const session = { id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date(), ...data };
        store.sessions.push(session);
        return session;
      },
      findFirst: async ({ where }) => {
        return store.sessions.find(s => s.userId === where.userId && !s.isRevoked) || null;
      },
      findUnique: async ({ where }) => {
        return store.sessions.find(s => s.id === where.id) || null;
      },
      update: async ({ where, data }) => {
        const s = store.sessions.find(sess => sess.id === where.id);
        if (s) Object.assign(s, data);
        return s;
      }
    },
    customer: {
      findUnique: async ({ where }) => {
        return store.customers.find(c => (where.id && c.id === where.id) || (where.email && c.email.toLowerCase() === where.email.toLowerCase())) || null;
      },
      findFirst: async ({ where }) => {
        return store.customers.find(c => (where?.id && c.id === where.id) || (where?.email && c.email.toLowerCase() === where.email.toLowerCase())) || null;
      },
      findMany: async (args = {}) => {
        let result = [...store.customers];
        if (args.where?.deletedAt === null) {
          result = result.filter(c => c.deletedAt === null);
        }
        return result;
      },
      count: async () => store.customers.filter(c => c.deletedAt === null).length,
      create: async ({ data }) => {
        const customer = { id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date(), deletedAt: null, csatAverage: null, ...data };
        store.customers.push(customer);
        return customer;
      },
      update: async ({ where, data }) => {
        const c = store.customers.find(item => item.id === where.id);
        if (!c) throw new Error('Customer not found');
        Object.assign(c, data, { updatedAt: new Date() });
        return c;
      },
      delete: async ({ where }) => {
        const c = store.customers.find(item => item.id === where.id);
        if (c) c.deletedAt = new Date();
        return c;
      }
    },
    ticket: {
      findUnique: async ({ where, include }) => {
        const t = store.tickets.find(item => item.id === where.id);
        if (!t) return null;
        const res = { ...t };
        if (include?.customer) res.customer = store.customers.find(c => c.id === t.customerId);
        if (include?.assignedTo) res.assignedTo = store.users.find(u => u.id === t.assignedToId);
        if (include?.comments) res.comments = store.comments.filter(c => c.ticketId === t.id);
        return res;
      },
      findFirst: async ({ where, include }) => {
        const t = store.tickets.find(item => {
          if (where?.id && item.id !== where.id) return false;
          if (where?.ticketNumber && item.ticketNumber !== where.ticketNumber) return false;
          return true;
        });
        if (!t) return null;
        const res = { ...t };
        if (include?.customer) res.customer = store.customers.find(c => c.id === t.customerId);
        if (include?.assignedTo) res.assignedTo = store.users.find(u => u.id === t.assignedToId);
        if (include?.comments) res.comments = store.comments.filter(c => c.ticketId === t.id);
        return res;
      },
      findMany: async (args = {}) => {
        let res = store.tickets.filter(t => t.deletedAt === null);
        if (args.where?.status) res = res.filter(t => t.status === args.where.status);
        if (args.where?.priority) res = res.filter(t => t.priority === args.where.priority);
        return res.map(t => ({
          ...t,
          customer: store.customers.find(c => c.id === t.customerId),
          assignedTo: store.users.find(u => u.id === t.assignedToId)
        }));
      },
      count: async (args = {}) => {
        let res = store.tickets.filter(t => t.deletedAt === null);
        if (args.where?.status) res = res.filter(t => t.status === args.where.status);
        return res.length;
      },
      create: async ({ data, include }) => {
        const ticket = {
          id: crypto.randomUUID(),
          ticketNumber: data.ticketNumber || `SP-${1000 + store.tickets.length + 1}`,
          slaBreached: false,
          firstResponseSlaBreached: false,
          firstResponseAt: null,
          resolvedAt: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'OPEN',
          ...data
        };
        if (!ticket.status) ticket.status = 'OPEN';
        store.tickets.push(ticket);
        const res = { ...ticket };
        if (include?.customer) res.customer = store.customers.find(c => c.id === ticket.customerId);
        if (include?.assignedTo) res.assignedTo = store.users.find(u => u.id === ticket.assignedToId);
        return res;
      },
      update: async ({ where, data }) => {
        const t = store.tickets.find(item => item.id === where.id);
        if (!t) throw new Error('Ticket not found');
        Object.assign(t, data, { updatedAt: new Date() });
        return t;
      }
    },
    ticketComment: {
      create: async ({ data, include }) => {
        const comment = { id: crypto.randomUUID(), createdAt: new Date(), ...data };
        store.comments.push(comment);
        const res = { ...comment };
        if (include?.authorUser) res.authorUser = store.users.find(u => u.id === comment.authorUserId);
        return res;
      },
      findMany: async ({ where }) => {
        return store.comments.filter(c => c.ticketId === where.ticketId);
      }
    },
    knowledgeDocument: {
      findUnique: async ({ where }) => {
        const k = store.knowledgeDocuments.find(doc => doc.id === where.id);
        if (!k) return null;
        return {
          ...k,
          chunks: k.chunks || [{ id: crypto.randomUUID(), documentId: k.id, content: 'Sample chunk content for testing.' }]
        };
      },
      findMany: async (args = {}) => {
        let res = [...store.knowledgeDocuments];
        if (args.where?.category) res = res.filter(k => k.category === args.where.category);
        if (args.where?.status) res = res.filter(k => k.status === args.where.status);
        return res;
      },
      count: async () => store.knowledgeDocuments.length,
      create: async ({ data }) => {
        const chunkContent = data.chunks?.create?.content || 'Initial chunk content';
        const doc = {
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'READY',
          ...data,
          chunks: [{ id: crypto.randomUUID(), content: chunkContent }]
        };
        store.knowledgeDocuments.push(doc);
        return doc;
      },
      update: async ({ where, data }) => {
        const doc = store.knowledgeDocuments.find(k => k.id === where.id);
        if (!doc) throw new Error('Document not found');
        Object.assign(doc, data, { updatedAt: new Date() });
        return doc;
      },
      delete: async ({ where }) => {
        const idx = store.knowledgeDocuments.findIndex(k => k.id === where.id);
        if (idx !== -1) store.knowledgeDocuments.splice(idx, 1);
        return { id: where.id };
      }
    },
    notification: {
      findMany: async ({ where, take, skip, orderBy }) => {
        let list = store.notifications.filter(n => n.recipientId === where.recipientId);
        if (where.isRead !== undefined) list = list.filter(n => n.isRead === where.isRead);
        return list.slice(skip || 0, (skip || 0) + (take || 20));
      },
      count: async ({ where } = {}) => {
        let list = store.notifications;
        if (where?.recipientId) list = list.filter(n => n.recipientId === where.recipientId);
        if (where?.isRead !== undefined) list = list.filter(n => n.isRead === where.isRead);
        return list.length;
      },
      create: async ({ data }) => {
        const notif = { id: `notif_${Date.now()}`, isRead: false, createdAt: new Date(), ...data };
        store.notifications.push(notif);
        return notif;
      },
      updateMany: async ({ where, data }) => {
        let count = 0;
        store.notifications.forEach(n => {
          if (where.recipientId && n.recipientId !== where.recipientId) return;
          if (where.id && n.id !== where.id) return;
          if (where.isRead !== undefined && n.isRead !== where.isRead) return;
          Object.assign(n, data);
          count++;
        });
        return { count };
      }
    },
    systemSetting: {
      findMany: async () => store.systemSettings.filter(s => !s.isSensitive),
      findUnique: async ({ where }) => store.systemSettings.find(s => s.configKey === where.configKey) || null,
      upsert: async ({ where, update, create }) => {
        let s = store.systemSettings.find(item => item.configKey === where.configKey);
        if (s) {
          Object.assign(s, update, { updatedAt: new Date() });
        } else {
          s = { ...create, updatedAt: new Date() };
          store.systemSettings.push(s);
        }
        return s;
      }
    },
    auditLog: {
      findMany: async ({ take } = {}) => {
        const res = store.auditLogs.map(a => ({
          ...a,
          actor: store.users.find(u => u.id === a.actorId) || null
        }));
        return res.slice(0, take || 50);
      },
      create: async ({ data }) => {
        const log = { id: `audit_${Date.now()}`, executedAt: new Date(), ...data };
        store.auditLogs.push(log);
        return log;
      }
    },
    analyticsEvent: {
      count: async (args = {}) => {
        if (args.where?.eventType === 'AI_ESCALATION') return 12;
        return 150;
      },
      aggregate: async () => ({ _avg: { metricVal: 0.88 } }),
      findMany: async (args = {}) => {
        if (args.where?.eventType === 'AI_ESCALATION') {
          return [{ eventType: 'AI_ESCALATION', recordedAt: new Date(), dimensions: { priority: 'HIGH' } }];
        }
        return [
          { eventType: 'AI_RESPONSE', recordedAt: new Date(), dimensions: null },
          { eventType: 'AI_ESCALATION', recordedAt: new Date(), dimensions: { priority: 'HIGH' } }
        ];
      }
    },
    chat: {
      findMany: async (args = {}) => {
        let res = [...store.chats];
        if (args.where?.assignedAgentId) {
          res = res.filter(c => c.assignedAgentId === args.where.assignedAgentId);
        }
        return res.map(c => ({
          ...c,
          customer: store.customers.find(cust => cust.id === c.customerId) || null,
          messages: store.messages.filter(m => m.chatId === c.id).slice(0, 1)
        }));
      },
      findUnique: async ({ where }) => store.chats.find(c => c.id === where.id) || null,
      findFirst: async ({ where }) => store.chats.find(c => c.id === where.id) || null,
      count: async () => store.chats.length
    },
    message: {
      findMany: async ({ where, skip, take }) => {
        let list = store.messages.filter(m => m.chatId === where.chatId);
        return list.slice(skip || 0, (skip || 0) + (take || 50));
      },
      count: async ({ where }) => store.messages.filter(m => m.chatId === where.chatId).length,
      create: async ({ data }) => {
        const msg = { id: `msg_${Date.now()}`, createdAt: new Date(), ...data };
        store.messages.push(msg);
        return msg;
      }
    }
  };
}
