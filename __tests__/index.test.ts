
import * as fs from 'fs';
import * as path from 'path';
import { crawlDirectory } from '../src/index';

jest.mock('fs');
jest.mock('path');

describe('Codebaser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crawlDirectory', () => {
    it('should process files according to template config', () => {
      const mockFiles = ['test.js', 'test.ts', 'test.md', 'node_modules'];
      const mockConfig = {
        extensions: ['.js', '.ts'],
        ignoredDirs: ['node_modules'],
        ignoredFiles: ['.md']
      };

      (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
      (fs.statSync as jest.Mock).mockImplementation((file: string) => ({
        isDirectory: () => file === 'node_modules',
        isFile: () => file !== 'node_modules'
      }));
      (fs.readFileSync as jest.Mock).mockReturnValue('file content');
      (path.extname as jest.Mock).mockImplementation(file => '.' + file.split('.')[1]);
      (path.join as jest.Mock).mockImplementation((dir, file) => `${dir}/${file}`);

      const result = crawlDirectory('/test', mockConfig);
      
      expect(result).toContain('file content');
      expect(fs.readFileSync).toHaveBeenCalledTimes(2); // Only .js and .ts files
    });

    it('should handle file read errors gracefully', () => {
      const mockFiles = ['test.js'];
      const mockConfig = {
        extensions: ['.js'],
        ignoredDirs: [],
        ignoredFiles: []
      };

      (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
      (fs.statSync as jest.Mock).mockImplementation(() => ({
        isDirectory: () => false,
        isFile: () => true
      }));
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Read error');
      });

      const consoleSpy = jest.spyOn(console, 'error');
      const result = crawlDirectory('/test', mockConfig);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Read error'));
      expect(result).toBe('\n// File: /test/test.js\n\n');
    });
  });
});