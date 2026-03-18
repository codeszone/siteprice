const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { generateExplanation, app } = require('../api/index.js');

test('generateExplanation', async (t) => {
  await t.test('returns expected explanation for typical inputs', () => {
    const data = {
      age: 5,
      traffic: 1000,
      seo_score: 70,
      monthly_revenue: 500,
      site_value: 12000,
      multiplier: 24.5
    };
    const expected = "This website generates moderate traffic of 1000 and estimated monthly revenue of ₹500.\nBased on SEO strength of 70 and domain age of 5, its value is ₹12000 with a multiplier of 24.5.";

    const result = generateExplanation(data);
    assert.strictEqual(result, expected);
  });

  await t.test('handles zero values correctly', () => {
    const data = {
      age: 0,
      traffic: 0,
      seo_score: 0,
      monthly_revenue: 0,
      site_value: 0,
      multiplier: 24
    };
    const expected = "This website generates moderate traffic of 0 and estimated monthly revenue of ₹0.\nBased on SEO strength of 0 and domain age of 0, its value is ₹0 with a multiplier of 24.";

    const result = generateExplanation(data);
    assert.strictEqual(result, expected);
  });

  await t.test('handles missing properties as undefined', () => {
    const data = {
      age: 2
    };
    const expected = "This website generates moderate traffic of undefined and estimated monthly revenue of ₹undefined.\nBased on SEO strength of undefined and domain age of 2, its value is ₹undefined with a multiplier of undefined.";

    const result = generateExplanation(data);
    assert.strictEqual(result, expected);
  });
});

describe('GET /api/site', () => {
  it('returns data for default domain if no domain query is provided', async () => {
    const response = await request(app).get('/api/site');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('domain', 'example.com');
  });

  it('returns data for specific domain if provided in query', async () => {
    const response = await request(app).get('/api/site?domain=test.com');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('domain', 'test.com');
  });

  it('response contains all expected fields', async () => {
    const response = await request(app).get('/api/site?domain=test.com');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('domain');
    expect(response.body).toHaveProperty('age');
    expect(response.body).toHaveProperty('traffic');
    expect(response.body).toHaveProperty('monthly_revenue');
    expect(response.body).toHaveProperty('multiplier');
    expect(response.body).toHaveProperty('site_value');
    expect(response.body).toHaveProperty('seo_score');
    expect(response.body).toHaveProperty('explanation');
  });

  it('caching works for repeated requests to the same domain', async () => {
    const response1 = await request(app).get('/api/site?domain=cached.com');
    const response2 = await request(app).get('/api/site?domain=cached.com');

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response1.body).toEqual(response2.body);
  });
});
