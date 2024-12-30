#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlDirectory = crawlDirectory;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const templates = {
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
function crawlDirectory(dir, config) {
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
                }
                else if (stats.isFile()) {
                    const ext = path.extname(file);
                    if (config.extensions.includes(ext) &&
                        !config.ignoredFiles.some(ignored => file.endsWith(ignored))) {
                        output += `\n// File: ${filePath}\n`;
                        try {
                            const fileContent = fs.readFileSync(filePath, 'utf-8');
                            output += fileContent;
                            output += '\n\n';
                        }
                        catch (error) {
                            console.error(`Error reading ${filePath}: ${error.message}`);
                            output += '\n';
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Error accessing ${filePath}: ${error.message}`);
            }
        }
    }
    catch (error) {
        console.error(`Error reading directory ${dir}: ${error.message}`);
    }
    return output;
}
function main() {
    const template = process.argv[2];
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
        }
        catch (error) {
            console.error(`Error validating directory ${dir}: ${error.message}`);
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
        console.log(`Flattened ${template} code from ${targetDirs.length} director${targetDirs.length > 1 ? 'ies' : 'y'} saved to ${outputPath}`);
    }
    catch (error) {
        console.error(`Error writing output file: ${error.message}`);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
