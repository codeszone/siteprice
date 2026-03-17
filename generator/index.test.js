const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const { generate, domains } = require('./index');

// Mock external dependencies
jest.mock('fs-extra');
jest.mock('axios');

describe('generate script', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock successful fs operations
    fs.readFile.mockResolvedValue('<html><body>{{domain}} - {{value}}</body></html>');
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should successfully generate files for all domains', async () => {
    // Mock successful API response dynamically so the correct domain is in data
    axios.get.mockImplementation(async (url) => {
      const urlObj = new URL(url);
      const domainParam = urlObj.searchParams.get('domain');
      return {
        data: {
          domain: domainParam || 'test.com',
          site_value: 50000,
          traffic: 1000,
          seo_score: 80,
          explanation: 'Test'
        }
      };
    });

    await generate();

    // Verify template was read
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('frontend', 'template.html')),
      'utf8'
    );

    // Verify API was called for each domain
    expect(axios.get).toHaveBeenCalledTimes(domains.length);
    domains.forEach((domain) => {
      expect(axios.get).toHaveBeenCalledWith(`http://localhost:3000/api/site?domain=${domain}`);
    });

    // Verify files were written for each domain
    expect(fs.ensureDir).toHaveBeenCalledTimes(domains.length);
    expect(fs.writeFile).toHaveBeenCalledTimes(domains.length + 1);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('output', 'sitemap.xml')),
      expect.stringContaining('<?xml version="1.0" encoding="UTF-8"?>'),
      'utf8'
    );
    expect(consoleLogSpy).toHaveBeenCalledWith('Generated sitemap.xml');

    domains.forEach((domain) => {
      // Check output directory creation
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining(path.join('output', 'website-worth', domain))
      );

      // Check file writing
      const expectedOutput = `<html><body>${domain} - 50000</body></html>`;
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(path.join('output', 'website-worth', domain, 'index.html')),
        expectedOutput,
        'utf8'
      );

      // Check success logging
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Generated ${path.join(__dirname, '../output/website-worth', domain, 'index.html')}`)
      );
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('output', 'sitemap.xml')),
      expect.stringContaining('<?xml version="1.0" encoding="UTF-8"?>'),
      'utf8'
    );
    expect(consoleLogSpy).toHaveBeenCalledWith('Generated sitemap.xml');
  });

  it('should handle API errors and log them', async () => {
    // Mock API failure
    const errorMessage = 'Network Error';
    axios.get.mockRejectedValue(new Error(errorMessage));

    await generate();

    // Verify no files were written
    expect(fs.ensureDir).not.toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledTimes(1); // the sitemap

    // Verify error logging for each domain
    expect(consoleErrorSpy).toHaveBeenCalledTimes(domains.length);
    domains.forEach((domain) => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to generate for ${domain}:`,
        errorMessage
      );
    });
  });

  it('should handle file system errors and log them', async () => {
    // Mock successful API response
    axios.get.mockImplementation(async (url) => {
      const urlObj = new URL(url);
      const domainParam = urlObj.searchParams.get('domain');
      return {
        data: {
          domain: domainParam || 'test.com',
          site_value: 50000,
        }
      };
    });

    // Mock fs failure
    const errorMessage = 'EACCES: permission denied';
    fs.writeFile.mockRejectedValue(new Error(errorMessage));

    await generate();

    // Verify error logging for each domain and sitemap
    expect(consoleErrorSpy).toHaveBeenCalledTimes(domains.length + 1);
    domains.forEach((domain) => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to generate for ${domain}:`,
        errorMessage
      );
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to generate sitemap:',
      errorMessage
    );
  });
});
