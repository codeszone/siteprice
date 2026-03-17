const test = require('node:test');
const assert = require('node:assert');
const { generateExplanation } = require('../api/index.js');

test('generateExplanation', async (t) => {
  await t.test('returns expected explanation for typical inputs', () => {
    const data = {
      age: 5,
      traffic: 1000,
      seo_score: 70
    };
    const expected = "The value is based on the site's age of 5 years and traffic of 1000 visitors.\nAdditionally, the SEO score of 70 contributes to its overall worth.";

    const result = generateExplanation(data);
    assert.strictEqual(result, expected);
  });

  await t.test('handles zero values correctly', () => {
    const data = {
      age: 0,
      traffic: 0,
      seo_score: 0
    };
    const expected = "The value is based on the site's age of 0 years and traffic of 0 visitors.\nAdditionally, the SEO score of 0 contributes to its overall worth.";

    const result = generateExplanation(data);
    assert.strictEqual(result, expected);
  });

  await t.test('handles missing properties as undefined', () => {
    const data = {
      age: 2
    };
    const expected = "The value is based on the site's age of 2 years and traffic of undefined visitors.\nAdditionally, the SEO score of undefined contributes to its overall worth.";

    const result = generateExplanation(data);
    assert.strictEqual(result, expected);
  });
});
