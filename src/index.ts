#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

type TemplateKey = 'nodejs' | 'react' | 'python' | 'go' | 'rust' | 'arduino' | 'php' | 'docs';

interface Template {
  extensions: string[];
  ignoredDirs: string[];
  ignoredFiles: string[];
}

type Templates = Record<TemplateKey, Template>;

const templates: Templates = {
  nodejs: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.cjs', '.mjs'],
    ignoredDirs: ['node_modules', 'dist', 'build', 'coverage', '.git'],
    ignoredFiles: ['.env', '.log', '.json', '.lock', '.sqlite', '.sqlite3']
  },
  react: {
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
    ignoredDirs: ['node_modules', 'build', 'dist', '.git'],
    ignoredFiles: ['.env', '.css', '.scss', '.svg', '.png', '.jpg']
  },
  python: {
    extensions: ['.py', '.pyx', '.pyi', '.pyw'],
    ignoredDirs: ['venv', 'env', '__pycache__', '.git', 'dist', 'build'],
    ignoredFiles: ['.pyc', '.pyo', '.pyd', '.log', '.sqlite']
  },
  go: {
    extensions: ['.go'],
    ignoredDirs: ['vendor', 'bin', '.git'],
    ignoredFiles: ['.sum', '.mod']
  },
  rust: {
    extensions: ['.rs'],
    ignoredDirs: ['target', '.git'],
    ignoredFiles: ['.lock', '.toml']
  },
  arduino: {
    extensions: ['.ino', '.cpp', '.h'],
    ignoredDirs: ['build', '.git'],
    ignoredFiles: ['.hex', '.elf']
  },
  php: {
    extensions: ['.php'],
    ignoredDirs: ['vendor', 'cache', '.git'],
    ignoredFiles: ['.log', '.env', '.lock']
  },
  docs: {
    extensions: ['.md', '.mdx', '.markdown'],
    ignoredDirs: ['.git', 'node_modules'],
    ignoredFiles: ['.log']
  }
};

export function crawlDirectory(dir: string, config: Template): string {
  let output = '';

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      
      try {
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          if (!config.ignoredDirs.includes(file)) {
            output += crawlDirectory(filePath, config);
          }
        } else if (stats.isFile()) {
          const ext = path.extname(file);
          if (
            config.extensions.includes(ext) &&
            !config.ignoredFiles.some(ignored => file.endsWith(ignored))
          ) {
            output += `\n// File: ${filePath}\n`;
            try {
              const fileContent = fs.readFileSync(filePath, 'utf-8');
              output += fileContent;
              output += '\n\n';
            } catch (error) {
              console.error(`Error reading ${filePath}: ${(error as Error).message}`);
              output += '\n';
            }
          }
        }
      } catch (error) {
        console.error(`Error accessing ${filePath}: ${(error as Error).message}`);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}: ${(error as Error).message}`);
  }

  return output;
}

function main(): void {
  const template = process.argv[2] as TemplateKey | undefined;
  const dirs = process.argv.slice(3);

  if (!template || !templates[template]) {
    console.log('Available templates:', Object.keys(templates).join(', '));
    console.log('Usage: node flatten.js <template> [directories...]');
    process.exit(1);
  }

  const targetDirs = dirs.length > 0 
    ? dirs.map(dir => path.resolve(dir))
    : [process.cwd()];

  // Validate directories
  for (const dir of targetDirs) {
    try {
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        console.error(`Error: "${dir}" is not a valid directory.`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error validating directory ${dir}: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  let output = '';
  for (const dir of targetDirs) {
    output += `\n// Directory: ${dir}\n`;
    output += crawlDirectory(dir, templates[template]);
  }

  const outputDir = process.cwd();
  const outputPath = process.env.OUTPUT_PATH || 
    path.join(outputDir, `flattened_${template}_code.txt`);

  try {
    fs.writeFileSync(outputPath, output);
    console.log(
      `Flattened ${template} code from ${targetDirs.length} director${
        targetDirs.length > 1 ? 'ies' : 'y'
      } saved to ${outputPath}`
    );
  } catch (error) {
    console.error(`Error writing output file: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}