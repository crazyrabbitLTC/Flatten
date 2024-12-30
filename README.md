# Codebaser

A CLI tool to flatten codebases into single files with predefined templates for different project types.

## Installation

```bash
npx codebaser
```

## Usage

```bash
npx codebaser <template> [directories...]
```

Example:
```bash
npx codebaser react src components
```

## Available Templates

- `nodejs`: JavaScript/TypeScript Node.js projects
- `react`: React/Next.js projects
- `python`: Python projects
- `go`: Go projects
- `rust`: Rust projects
- `arduino`: Arduino projects
- `php`: PHP projects
- `docs`: Documentation files (.md, .mdx)

## Configuration

Environment variables:
- `ENCODING`: Set file encoding (default: utf-8)
- `OUTPUT_PATH`: Custom output file path

## Requirements

- Node.js >= 14.0.0

## License

MIT