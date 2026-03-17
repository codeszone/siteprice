const express = require('express');
const app = express();
const port = 3000;

function generateExplanation(data) {
  return `The value is based on the site's age of ${data.age} years and traffic of ${data.traffic} visitors.\nAdditionally, the SEO score of ${data.seo_score} contributes to its overall worth.`;
}

app.get('/api/site', (req, res) => {
  const domain = req.query.domain;

  // The requirement says to return a mock JSON.
  // It doesn't explicitly say to use the domain from query, but usually it should.
  // I will just return the exact JSON requested.

  const siteData = {
    "domain": "example.com",
    "age": 5,
    "traffic": 1000,
    "value": 50000,
    "seo_score": 70
  };

  siteData.explanation = generateExplanation(siteData);

  res.json(siteData);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
