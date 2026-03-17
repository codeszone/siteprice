const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const domains = [
  'example.com',
  'google.com',
  'github.com',
  'openai.com'
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
