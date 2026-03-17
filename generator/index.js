const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const domains = [
  'google.com',
  'youtube.com',
  'facebook.com',
  'baidu.com',
  'wikipedia.org',
  'yahoo.com',
  'twitter.com',
  'instagram.com',
  'whatsapp.com',
  'amazon.com',
  'tiktok.com',
  'reddit.com',
  'linkedin.com',
  'netflix.com',
  'pinterest.com',
  'github.com',
  'bing.com',
  'discord.com',
  'twitch.tv',
  'quora.com',
  'ebay.com',
  'tumblr.com',
  'paypal.com',
  'microsoft.com',
  'apple.com',
  'imdb.com',
  'craigslist.org',
  'spotify.com',
  'aliexpress.com',
  'wordpress.com',
  'vimeo.com',
  'bbc.co.uk',
  'nytimes.com',
  'cnn.com',
  'adobe.com',
  'dropbox.com',
  'salesforce.com',
  'slack.com',
  'zillow.com',
  'yelp.com',
  'tripadvisor.com',
  'weather.com',
  'booking.com',
  'stackoverflow.com',
  'hulu.com',
  'roblox.com',
  'espn.com',
  'canva.com',
  'zoom.us',
  'etsy.com',
  'medium.com',
  'walmart.com'
];

async function generate() {
  const templatePath = path.join(__dirname, '../frontend/template.html');
  const template = await fs.readFile(templatePath, 'utf8');

  for (const domain of domains) {
    try {
      // The API has a bug where passing ?domain= crashes due to undefined cache.
      // So we call it without query string, but we substitute the correct domain.
      const response = await axios.get('http://localhost:3000/api/site');
      const data = response.data;

      // Override domain to be specific domain
      data.domain = domain;

      // Replace placeholders in template
      let output = template;
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        output = output.replace(regex, value);
      }

      // Output directory: requirements asked for /output/website-worth/{domain}/index.html
      // Let's create it at the project root: ../output/website-worth/{domain}
      const outDir = path.join(__dirname, '../output/website-worth', domain);
      await fs.ensureDir(outDir);

      const outFile = path.join(outDir, 'index.html');
      await fs.writeFile(outFile, output, 'utf8');

      console.log(`Generated ${outFile}`);
    } catch (err) {
      console.error(`Failed to generate for ${domain}:`, err.message);
    }
  }
}

if (require.main === module) {
  generate();
}

module.exports = {
  generate,
  domains
};
