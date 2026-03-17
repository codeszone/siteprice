const express = require('express');
const app = express();
const port = 3000;

const cache = {};

app.get('/api/site', (req, res) => {
  const domain = req.query.domain;

  if (domain && cache[domain]) {
    return res.json(cache[domain]);
  }

  // The requirement says to return a mock JSON.
  // It doesn't explicitly say to use the domain from query, but usually it should.
  // I will just return the exact JSON requested.

  const response = {
    "domain": "example.com",
    "age": 5,
    "traffic": 1000,
    "value": 50000,
    "seo_score": 70,
    "explanation": "This is a sample site value."
  };

  if (domain) {
    cache[domain] = response;
  }

  res.json(response);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
