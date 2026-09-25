// tests/e2e/tier3-cross-feature/customer-ticket-360-flow.test.mjs
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getBackendApp, dispatchRequest, loginAs, resetBackendStore } from '../helpers/in-memory-backend.mjs';

describe('Tier 3: Cross-Feature Flow — Customer Creation ➔ Ticket Association ➔ Customer 360', () => {
  let app;
  let adminSession;

  before(async () => {
    app = await getBackendApp();
    adminSession = await loginAs(app, 'admin@example.com', 'Password123!');
  });

  beforeEach(() => {
    resetBackendStore();
  });

  it('Flow: Create enterprise customer, associate multiple tickets, and verify relational data', async () => {
    // 1. Create a new corporate customer
    const createCustomerRes = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/customers',
      headers: adminSession.authHeader,
      body: {
        email: 'devops@starkindustries.com',
        displayName: 'Tony Stark',
        companyName: 'Stark Industries',
        phoneNumber: '+1-212-555-3000',
        metadata: { enterprisePlan: 'Palladium Tier', seats: 500 }
      }
    });

    assert.equal(createCustomerRes.statusCode, 201, 'Customer must be created');
    const customerId = createCustomerRes.body.id;
    assert.ok(customerId, 'Must receive customer ID');

    // 2. Create Ticket 1 (Urgent)
    const ticket1Res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/tickets',
      headers: adminSession.authHeader,
      body: {
        customerId,
        subject: 'Arc Reactor Telemetry Ingestion Failure',
        description: 'High throughput telemetry packet loss across sensor arrays.',
        priority: 'URGENT',
        category: 'IOT_INGRESS'
      }
    });

    assert.equal(ticket1Res.statusCode, 201);
    const ticket1 = ticket1Res.body.data;
    assert.equal(ticket1.customerId, customerId);

    // 3. Create Ticket 2 (Medium)
    const ticket2Res = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/tickets',
      headers: adminSession.authHeader,
      body: {
        customerId,
        subject: 'Request for additional API tokens',
        description: 'Expanding CI runner nodes across secondary datacenter.',
        priority: 'MEDIUM',
        category: 'ACCOUNT'
      }
    });

    assert.equal(ticket2Res.statusCode, 201);
    const ticket2 = ticket2Res.body.data;
    assert.equal(ticket2.customerId, customerId);

    // 4. Fetch customer profile and verify data
    const fetchCustomerRes = await dispatchRequest(app, {
      method: 'GET',
      url: `/api/v1/customers/${customerId}`,
      headers: adminSession.authHeader
    });

    assert.equal(fetchCustomerRes.statusCode, 200);
    assert.equal(fetchCustomerRes.body.displayName, 'Tony Stark');
    assert.equal(fetchCustomerRes.body.companyName, 'Stark Industries');

    // 5. Query tickets list and verify both tickets exist for this customer
    const listTicketsRes = await dispatchRequest(app, {
      method: 'GET',
      url: `/api/v1/tickets`,
      headers: adminSession.authHeader
    });

    assert.equal(listTicketsRes.statusCode, 200);
    const tickets = listTicketsRes.body.data;
    const customerTickets = tickets.filter(t => t.customerId === customerId);
    assert.equal(customerTickets.length, 2, 'Must find 2 tickets associated with the new customer');
  });
});
