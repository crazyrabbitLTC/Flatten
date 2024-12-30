#!/usr/bin/env node
interface Template {
    extensions: string[];
    ignoredDirs: string[];
    ignoredFiles: string[];
}
export declare function crawlDirectory(dir: string, config: Template): string;
export {};
