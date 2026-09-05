import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

let hasError = false;

// Files/folders we strictly enforce the 10KB limit on for now:
const ENFORCED_PATHS = [
  'App.tsx',
  'features/feed',
  'components/shell',
  'server'
];

function isEnforced(fullPath) {
  const relativePath = path.relative(srcDir, fullPath).replace(/\\/g, '/');
  return ENFORCED_PATHS.some(p => relativePath === p || relativePath.startsWith(p + '/'));
}

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (isEnforced(fullPath) && stat.size > 10240) { // 10KB
        console.error(`Error: File ${fullPath} is too large (${(stat.size / 1024).toFixed(2)} KB). Max allowed is 10 KB.`);
        hasError = true;
      }
    }
  }
}

checkDir(srcDir);

if (hasError) {
  process.exit(1);
} else {
  console.log('All enforced files are under 10 KB limit.');
}
