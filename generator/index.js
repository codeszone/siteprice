const axios = require('axios');

const domains = [
  'example.com',
  'google.com',
  'github.com',
  'openai.com'
];

async function fetchData() {
  for (const domain of domains) {
    try {
      const response = await axios.get(`http://localhost:3000/api/site?domain=${domain}`);
      console.log(`Data for ${domain}:`, response.data);
    } catch (error) {
      console.error(`Error fetching data for ${domain}:`, error.message);
    }
  }
}

fetchData();
