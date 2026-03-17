const request = require('supertest');
const app = require('../index');

describe('GET /api/site', () => {
  it('should return mock data when no domain is provided', async () => {
    const response = await request(app).get('/api/site');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('domain', 'example.com');
    expect(response.body).toHaveProperty('value', 50000);
  });

  it('should not throw an error and return mock data when a domain is provided', async () => {
    const response = await request(app).get('/api/site?domain=test.com');
    expect(response.status).toBe(200);
    // Even if domain is provided, since it's not in cache, it returns the mock JSON
    expect(response.body).toHaveProperty('domain', 'example.com');
  });
});
