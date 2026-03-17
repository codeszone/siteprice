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
    // Mock successful API response
    const mockData = {
      domain: 'test.com', // The script overwrites this
      value: 50000,
    };
    axios.get.mockResolvedValue({ data: mockData });

    await generate();

    // Verify template was read
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('frontend', 'template.html')),
      'utf8'
    );

    // Verify API was called for each domain
    expect(axios.get).toHaveBeenCalledTimes(domains.length);
    domains.forEach(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/api/site');
    });

    // Verify files were written for each domain
    expect(fs.ensureDir).toHaveBeenCalledTimes(domains.length);
    expect(fs.writeFile).toHaveBeenCalledTimes(domains.length);

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
  });

  it('should handle API errors and log them', async () => {
    // Mock API failure
    const errorMessage = 'Network Error';
    axios.get.mockRejectedValue(new Error(errorMessage));

    await generate();

    // Verify no files were written
    expect(fs.ensureDir).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();

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
    const mockData = {
      domain: 'test.com',
      value: 50000,
    };
    axios.get.mockResolvedValue({ data: mockData });

    // Mock fs failure
    const errorMessage = 'EACCES: permission denied';
    fs.writeFile.mockRejectedValue(new Error(errorMessage));

    await generate();

    // Verify error logging for each domain
    expect(consoleErrorSpy).toHaveBeenCalledTimes(domains.length);
    domains.forEach((domain) => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Failed to generate for ${domain}:`,
        errorMessage
      );
    });
  });
});
