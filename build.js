const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure the .cache folder exists
const cacheDir = path.resolve(__dirname, './.cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
  console.log('Created .cache directory');
}

// Ensure the dist/.cache folder exists
const distCacheDir = path.resolve(__dirname, './dist/.cache');
if (!fs.existsSync(distCacheDir)) {
  fs.mkdirSync(distCacheDir, { recursive: true });
  console.log('Created dist/.cache directory');
}

esbuild
  .build({
    entryPoints: ['./src/server/index.ts'], // Entry point for the server
    outfile: './dist/server.mjs', // Output file
    bundle: true, // Bundle all dependencies
    platform: 'node', // Target Node.js environment
    target: 'esnext', // JavaScript target version
    sourcemap: true, // Generate source maps
    format: 'esm', // Use ESM format for compatibility with "import" statements
    banner: {
      js: `
        // Suppress or redirect console.log based on the CLAUDE_MCP environment variable
        if (process.env.CLAUDE_MCP) {
          console.log = (...args) => {
            process.stderr.write(args.join(' ') + '\\n'); // Redirect logs to stderr
          };
        }

        import { fileURLToPath } from 'url';
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        import { createRequire } from 'module';
        const require = createRequire(import.meta.url);
        import { performance } from 'perf_hooks';
        process.chdir(__dirname); // Set the working directory to the directory of the script
        console.log('Working directory set to:', process.cwd());
      `.trim(), // Combine all shims
    },
    plugins: [
      {
        name: 'remove-node-prefix',
        setup(build) {
          build.onResolve({ filter: /^node:/ }, args => {
            return { path: args.path.replace(/^node:/, ''), external: true };
          });
        },
      },
    ],
  })
  .catch(() => process.exit(1));
