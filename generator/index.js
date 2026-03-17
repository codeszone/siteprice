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

  const generatedPages = [];

  for (const domain of domains) {
    try {
      // Pass the domain query correctly since we added Object.create(null) and default value
      const response = await axios.get(`http://localhost:3000/api/site?domain=${domain}`);
      const data = response.data;

      // Replace placeholders: {{domain}}, {{value}}, {{traffic}}, {{seo_score}}, {{explanation}}
      let output = template;
      output = output.replace(/\{\{domain\}\}/g, data.domain);
      output = output.replace(/\{\{value\}\}/g, data.site_value); // map value to site_value
      output = output.replace(/\{\{traffic\}\}/g, data.traffic);
      output = output.replace(/\{\{seo_score\}\}/g, data.seo_score);
      output = output.replace(/\{\{explanation\}\}/g, data.explanation);

      // Output directory: /output/website-worth/{domain}/index.html
      const outDir = path.join(__dirname, '../output/website-worth', domain);
      await fs.ensureDir(outDir);

      const outFile = path.join(outDir, 'index.html');
      await fs.writeFile(outFile, output, 'utf8');

      console.log(`Generated ${outFile}`);
      // Requirement: include all URLs in format /website-worth/{domain}
      generatedPages.push(`/website-worth/${domain}`);
    } catch (err) {
      console.error(`Failed to generate for ${domain}:`, err.message);
    }
  }

  try {
    const sitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      generatedPages.map(page => `  <url>\n    <loc>${page}</loc>\n  </url>`).join('\n') +
      '\n</urlset>';
    await fs.writeFile(path.join(__dirname, '../output/sitemap.xml'), sitemapContent, 'utf8');
    console.log('Generated sitemap.xml');
  } catch (err) {
    console.error('Failed to generate sitemap:', err.message);
  }
}

if (require.main === module) {
  generate();
}

module.exports = {
  generate,
  domains
};
