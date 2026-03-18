const express = require('express');
const app = express();
const port = 3000;

const cache = Object.create(null);

function generateExplanation(data) {
  return `This website generates moderate traffic of ${data.traffic} and estimated monthly revenue of ₹${data.monthly_revenue}.\nBased on SEO strength of ${data.seo_score} and domain age of ${data.age}, its value is ₹${data.site_value} with a multiplier of ${data.multiplier}.`;
}

app.get('/api/site', (req, res) => {
  const domain = req.query.domain || 'example.com';

  if (cache[domain]) {
    return res.json(cache[domain]);
  }

  // Calculate deterministic pseudo-random values
  let seed = 0;
  for (let i = 0; i < domain.length; i++) {
    seed += domain.charCodeAt(i);
  }

  function getNumber(min, max, offset) {
    const random = Math.abs(Math.sin(seed + offset));
    return Math.floor(random * (max - min + 1)) + min;
  }

  const age = getNumber(1, 10, 1);
  const indexed_pages = getNumber(100, 1000, 2);
  const backlinks = getNumber(10, 500, 3);
  const seo_score = getNumber(10, 100, 4);

  const traffic = (indexed_pages * 0.015 * 20) + (backlinks * 0.2);
  const revenue = traffic * 0.02 * 10;
  const age_bonus = age * 0.5;
  const traffic_bonus = traffic * 0.001;
  const multiplier = 24 - (seo_score / 10) + age_bonus + traffic_bonus;
  const site_value = revenue * multiplier;

  const siteData = {
    domain,
    age,
    traffic,
    monthly_revenue: revenue,
    multiplier,
    site_value,
    seo_score
  };

  siteData.explanation = generateExplanation(siteData);

  cache[domain] = siteData;

  res.json(siteData);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = { generateExplanation, app };
