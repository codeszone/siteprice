const express = require('express');
const app = express();
const port = 3000;

app.get('/api/site', (req, res) => {
  const domain = req.query.domain;

  // The requirement says to return a mock JSON.
  // It doesn't explicitly say to use the domain from query, but usually it should.
  // I will just return the exact JSON requested.

  const age = Math.floor(Math.random() * 10) + 1;
  const traffic = Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
  const monthly_revenue = traffic * 0.02 * 10;
  const value = Math.round(monthly_revenue * 30);
  const seo_score = Math.floor(Math.random() * (90 - 50 + 1)) + 50;

  res.json({
    "domain": "example.com",
    "age": age,
    "traffic": traffic,
    "value": value,
    "seo_score": seo_score,
    "explanation": "This is a sample site value."
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
