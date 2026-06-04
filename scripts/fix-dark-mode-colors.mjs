import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const files = [
  'src/components/activities/HumanPerformanceExperiment.tsx',
  'src/components/activities/HumanPerformanceForm.tsx',
  'src/components/activities/ParachuteDropForm.tsx',
  'src/components/activities/SoundPollutionForm.tsx',
  'src/components/activities/SoundPollutionResults.tsx',
  'app/(tabs)/activities/[activityId].tsx',
  'src/components/activities/BreathingPaceForm.tsx',
  'src/components/activities/HandFanPostActivity.tsx',
  'src/components/activities/EarthquakeForm.tsx',
  'src/components/activities/ReactionBoardForm.tsx',
  'src/components/activities/BreathingPaceExperiment.tsx',
  'src/components/activities/ParachuteDropPostActivity.tsx',
  'app/index.tsx',
  'src/components/activities/ReactionBoardExperiment.tsx',
  'src/components/activities/HandFanForm.tsx',
].map((f) => path.join(root, f));

function themePaths(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  if (rel.startsWith('app/(tabs)/activities')) {
    return {
      theme: '../../../src/context/ThemeContext',
      hook: '../../../src/hooks/useThemedStyles',
      themeImport: '../../../src/theme',
    };
  }
  if (rel.startsWith('app/')) {
    return {
      theme: '../src/context/ThemeContext',
      hook: '../src/hooks/useThemedStyles',
      themeImport: '../src/theme',
    };
  }
  return {
    theme: '../../context/ThemeContext',
    hook: '../../hooks/useThemedStyles',
    themeImport: '../../theme',
  };
}

function extractStyleBlocks(content) {
  const blocks = [];
  const re = /const\s+(\w+)\s*=\s*StyleSheet\.create\s*\(\s*\{/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const name = m[1];
    let i = content.indexOf('{', m.index + m[0].length - 1);
    let depth = 0;
    for (; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          const end = content.indexOf(');', i);
          if (end === -1) break;
          blocks.push({
            name,
            start: m.index,
            end: end + 2,
            inner: content.slice(m.index + m[0].length - 1, i + 1),
          });
          break;
        }
      }
    }
  }
  return blocks.sort((a, b) => b.start - a.start);
}

function transformStyleInner(inner) {
  return inner
    .replace(/Colors\./g, 'colors.')
    .replace(/Typography\./g, 'typography.')
    .replace(/colors\.success/g, 'colors.secondary')
    .replace(/backgroundColor:\s*'#F8FAFC'/g, 'backgroundColor: colors.surface')
    .replace(/borderColor:\s*'#E2E8F0'/g, 'borderColor: colors.border')
    .replace(/color:\s*'#334155'/g, 'color: colors.text')
    .replace(/color:\s*'#475569'/g, 'color: colors.textSecondary')
    .replace(/color:\s*'#854d0e'/g, 'color: colors.text')
    .replace(/color:\s*'#666'/g, 'color: colors.textMuted')
    .replace(/backgroundColor:\s*'#eee'/g, 'backgroundColor: colors.border');
}

function migrate(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('missing', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('Colors')) {
    console.log('skip', path.relative(root, filePath));
    return;
  }

  const { theme, hook, themeImport } = themePaths(filePath);
  const blocks = extractStyleBlocks(content);
  if (blocks.length === 0) {
    console.warn('no blocks', filePath);
    return;
  }

  for (const b of blocks) {
    content = content.slice(0, b.start) + content.slice(b.end);
  }

  content = content.replace(/import \{ Colors, ([^}]+)\} from '([^']+)';/g, "import { $1 } from '$2';");
  content = content.replace(/import \{ Colors \} from '([^']+)';?\n?/g, '');
  content = content.replace(/, Typography/g, '');
  content = content.replace(/Typography, /g, '');

  if (!content.includes('useThemedStyles')) {
    const themeLine = `import { useTheme } from '${theme}';\nimport { useThemedStyles } from '${hook}';\n`;
    content = content.replace(
      /from '([^']*\/theme)';/,
      `from '${themeImport.replace(root + '/', '').replace(/\\/g, '/')}';${themeLine.includes(themeImport) ? '' : ''}`
    );
    // insert after last import
    const lastImportIdx = content.lastIndexOf('\nimport ');
    const lineEnd = content.indexOf('\n', lastImportIdx + 1);
    if (!content.includes("useTheme")) {
      content = content.slice(0, lineEnd + 1) + themeLine + content.slice(lineEnd + 1);
    }
  }

  const hookName =
    blocks.length === 1
      ? `use${blocks[0].name.charAt(0).toUpperCase() + blocks[0].name.slice(1)}Themed`
      : 'useComponentThemedStyles';

  const hookFns = blocks
    .map((b) => {
      const inner = transformStyleInner(b.inner);
      const fnName = `build${b.name.charAt(0).toUpperCase() + b.name.slice(1)}`;
      return `function ${fnName}(colors, typography) {\n  return StyleSheet.create(${inner});\n}\n\nfunction use${b.name.charAt(0).toUpperCase() + b.name.slice(1)}() {\n  return useThemedStyles(({ colors, typography }) => ${fnName}(colors, typography));\n}`;
    })
    .join('\n\n');

  const insertHookBefore = content.search(/export (?:default )?function /);
  if (insertHookBefore === -1) {
    console.warn('no export', filePath);
    return;
  }
  content = content.slice(0, insertHookBefore) + hookFns + '\n\n' + content.slice(insertHookBefore);

  for (const b of blocks) {
    const hookCall = `use${b.name.charAt(0).toUpperCase() + b.name.slice(1)}()`;
    // inject into each export function if not present
    const exportRe = /export (?:default )?function \w+[^{]*\{/g;
    let em;
    while ((em = exportRe.exec(content)) !== null) {
      const bodyStart = em.index + em[0].length;
      const slice = content.slice(bodyStart, bodyStart + 400);
      if (!slice.includes(`const styles = ${hookCall}`) && !slice.includes(`const ${b.name} = ${hookCall}`)) {
        const needsColors = content.includes('colors.') || content.slice(bodyStart).includes('Colors.');
        const insert =
          (needsColors && !slice.includes('useTheme') ? '\n  const { colors } = useTheme();' : '') +
          `\n  const ${b.name === 'styles' ? 'styles' : b.name} = ${hookCall};`;
        content = content.slice(0, bodyStart) + insert + content.slice(bodyStart);
        exportRe.lastIndex = bodyStart + insert.length;
      }
    }
  }

  content = content.replace(/Colors\./g, 'colors.');
  content = content.replace(/colors\.success/g, 'colors.secondary');

  // Typography in inline JSX
  content = content.replace(/\.\.\.Typography\./g, '...typography.');

  fs.writeFileSync(filePath, content);
  console.log('ok', path.relative(root, filePath), blocks.map((b) => b.name).join(','));
}

for (const f of files) {
  try {
    migrate(f);
  } catch (e) {
    console.error('fail', f, e);
  }
}
