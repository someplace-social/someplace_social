import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import process from 'node:process';

const DEFAULT_INCLUDES: string[] = [
  'app/**/*',
  'components/**/*',
  'lib/**/*',
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'README.md'
];

const SECTIONS: Record<string, string[]> = {
  app: ['app/**/*'],
  components: ['app/components/**/*', 'components/**/*'],
  api: ['app/api/**/*'],
  medellin: ['app/medellin/**/*'],
  core: ['app/layout.tsx', 'app/page.tsx', 'app/globals.css', 'package.json', 'next.config.ts', 'tsconfig.json']
};

const IGNORES: string[] = [
  'node_modules',
  '.next',
  '.git',
  '.vercel',
  'pnpm-lock.yaml',
  'package-lock.json',
  'public/**/*',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.svg',
  '**/*.ico',
  '**/*.pdf',
  '**/*.lock',
  '**/dist/**',
  'repomix-output.txt',
  'project-context.txt',
  'ctx-map.txt',
  '.claude/settings.local.json',
  '**/.env*',
  '.env*'
];

function skeletonize(content: string): string {
  return content.replace(/(\s*\{\s*)([\s\S]*?)(\s*\})/g, (match, open, body, close) => {
    if (body.length > 40 && body.includes('\n')) {
      return `${open} /* implementation removed */ ${close}`;
    }
    return match;
  });
}

function generateProjectTree(dir = '.', prefix = ''): string {
  const ignoredFolders = new Set(['.git', '.next', 'node_modules', 'public', '.vercel', 'dist', 'out']);
  const items = fs.readdirSync(dir, { withFileTypes: true })
    .filter((i: fs.Dirent) => !ignoredFolders.has(i.name) && !i.name.startsWith('.') && !i.name.includes('lock'))
    .sort((a: fs.Dirent, b: fs.Dirent) => (b.isDirectory() ? 1 : 0) - (a.isDirectory() ? 1 : 0) || a.name.localeCompare(b.name));

  let output = '';
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const isLast = idx === items.length - 1;
    const marker = isLast ? '\\--- ' : '+--- ';
    output += `${prefix}${marker}${item.name}\n`;

    if (item.isDirectory()) {
      const subPrefix = prefix + (isLast ? '    ' : '|   ');
      output += generateProjectTree(`${dir}/${item.name}`, subPrefix);
    }
  }
  return output;
}

async function main(): Promise<void> {
  const startTime = Date.now();

  if (fs.existsSync('repomix-output.txt')) {
    try {
      fs.writeFileSync('repomix-output.txt', '', 'utf8');
    } catch {}
  }

  const rawArgs = process.argv.slice(2).map((a: string) => a.toLowerCase());
  const isMap = rawArgs.includes('map');
  const isFull = rawArgs.includes('full');
  const isSkeleton = rawArgs.includes('skeleton') || (!isMap && !isFull && rawArgs.length === 0);
  const domainArgs = rawArgs.filter((a: string) => a !== 'skeleton' && a !== 'map' && a !== 'full' && a !== 'db');

  const isMapOnly = isMap && !isSkeleton && !isFull && domainArgs.length === 0;

  if (isMapOnly) {
    const tree = generateProjectTree();
    const output = [
      '#TASK\n\n\n\n\n',
      '#PROJECT FILES\n\n',
      'Project Structure Map:\n+--- root\n',
      tree,
      '\n'
    ].join('');

    fs.writeFileSync('repomix-output.txt', output, 'utf8');
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Generated fresh repomix-output.txt (Map) in ${elapsed}s.`);
    try {
      execSync('code -r "repomix-output.txt"', { stdio: 'ignore' });
    } catch {
      try {
        execSync('code "repomix-output.txt"', { stdio: 'ignore' });
      } catch {}
    }
    return;
  }

  let includes: string[] = [];
  if (domainArgs.length === 0 || domainArgs.includes('all')) {
    includes = DEFAULT_INCLUDES;
  } else {
    domainArgs.forEach((arg: string) => {
      if (SECTIONS[arg]) {
        includes.push(...SECTIONS[arg]);
      } else {
        includes.push(arg);
      }
    });
  }

  const tempOutputFile = 'repomix.temp.out.txt';
  const repomixConfig = {
    output: {
      filePath: tempOutputFile,
      style: 'plain',
      removeComments: true,
      removeEmptyLines: true,
      showLineNumbers: false,
      topFilesLength: 0,
      showSummary: false,
      showDirectoryStructure: false
    },
    include: includes,
    ignore: {
      useGitignore: true,
      useDefaultPatterns: true,
      customPatterns: IGNORES
    }
  };

  fs.writeFileSync('repomix.temp.json', JSON.stringify(repomixConfig, null, 2));

  try {
    console.log(`Packing files with repomix (Skeleton: ${isSkeleton}, Full: ${isFull})...`);
    execSync('pnpm exec repomix --config repomix.temp.json', { stdio: 'inherit' });

    let fileContent = '';
    if (fs.existsSync(tempOutputFile)) {
      fileContent = fs.readFileSync(tempOutputFile, 'utf8');
      fs.unlinkSync(tempOutputFile);
    }

    if (isSkeleton) {
      console.log('Applying skeletonization...');
      fileContent = skeletonize(fileContent);
    }

    const chunks: string[] = [];
    chunks.push('#TASK\n\n\n\n\n');
    chunks.push('#PROJECT FILES\n\n');
    chunks.push('Project Structure Map:\n+--- root\n' + generateProjectTree() + '\n\n');
    chunks.push(fileContent);

    fs.writeFileSync('repomix-output.txt', chunks.join(''), 'utf8');

    if (fs.existsSync('repomix.temp.json')) {
      fs.unlinkSync('repomix.temp.json');
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Generated fresh repomix-output.txt in ${elapsed}s.`);

    try {
      execSync('code -r "repomix-output.txt"', { stdio: 'ignore' });
      console.log('Opened repomix-output.txt in VS Code.');
    } catch {
      try {
        execSync('code "repomix-output.txt"', { stdio: 'ignore' });
        console.log('Opened repomix-output.txt in VS Code.');
      } catch {}
    }
  } catch (error) {
    console.error('Execution failed:', error);
    if (fs.existsSync(tempOutputFile)) {
      fs.unlinkSync(tempOutputFile);
    }
    if (fs.existsSync('repomix.temp.json')) {
      fs.unlinkSync('repomix.temp.json');
    }
  }
}

main().catch((err: unknown) => {
  console.error('Error in context generator:', err);
  process.exit(1);
});