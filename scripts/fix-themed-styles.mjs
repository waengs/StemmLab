/**
 * Migrate module StyleSheet + Colors to useThemedStyles + useTheme.
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => path.join(root, f))
  : [
      'app/(tabs)/activities/[activityId].tsx',
      'app/index.tsx',
      'app/_layout.tsx',
      'src/components/activities/EarthquakePostActivity.tsx',
      'src/components/activities/HandFanResults.tsx',
      'src/components/activities/HandFanPostActivity.tsx',
      'src/components/activities/ParachuteDropResults.tsx',
      'src/components/activities/ReactionBoardPostActivity.tsx',
      'src/components/activities/HumanPerformancePostActivity.tsx',
      'src/components/activities/ParachuteDropPostActivity.tsx',
      'src/components/activities/BreathingPacePostActivity.tsx',
      'src/components/activities/SoundPollutionPostActivity.tsx',
      'src/components/activities/HandFanForm.tsx',
      'src/components/sensors/ReactionTestPanel.tsx',
      'src/components/sensors/VibrationSensorPanel.tsx',
      'src/components/activities/SoundPollutionResults.tsx',
      'src/components/activities/EarthquakeResults.tsx',
      'src/components/activities/HumanPerformanceExperiment.tsx',
      'src/components/activities/HumanPerformanceForm.tsx',
      'src/components/activities/ParachuteDropForm.tsx',
      'src/components/activities/EarthquakeForm.tsx',
      'src/components/activities/HumanPerformanceResults.tsx',
      'src/components/activities/ReactionBoardExperiment.tsx',
      'src/components/activities/ReactionBoardForm.tsx',
      'src/components/activities/ReactionBoardResults.tsx',
      'src/components/activities/BreathingPaceForm.tsx',
      'src/components/activities/BreathingPaceResults.tsx',
      'src/components/activities/BreathingPaceExperiment.tsx',
      'src/components/sensors/TrialVideoPlayer.tsx',
    ].map((f) => path.join(root, f));

function isAppFile(filePath) {
  return filePath.includes(`${path.sep}app${path.sep}`);
}

function themePaths(filePath) {
  if (filePath.includes('[activityId]')) {
    return {
      theme: '../../../src/context/ThemeContext',
      hooks: '../../../src/hooks/useThemedStyles',
      themeImport: '../../../src/theme',
    };
  }
  if (isAppFile(filePath)) {
    return {
      theme: '../src/context/ThemeContext',
      hooks: '../src/hooks/useThemedStyles',
      themeImport: '../src/theme',
    };
  }
  return {
    theme: '../../context/ThemeContext',
    hooks: '../../hooks/useThemedStyles',
    themeImport: '../../theme',
  };
}

function extractStyleBlocks(content) {
  const blocks = [];
  const regex = /const\s+(\w+)\s*=\s*StyleSheet\.create\(\{/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const name = m[1];
    const start = m.index;
    let depth = 0;
    let i = content.indexOf('{', m.index + m[0].length - 1);
    for (; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          const end = content.indexOf(');', i) + 2;
          const innerStart = content.indexOf('{', m.index);
          const innerEnd = i + 1;
          const inner = content.slice(innerStart, innerEnd);
          blocks.push({ name, start, end, inner });
          break;
        }
      }
    }
  }
  return blocks.sort((a, b) => b.start - a.start);
}

function transformInner(inner) {
  return inner
    .replace(/Colors\./g, 'colors.')
    .replace(/Typography\./g, 'typography.')
    .replace(/colors\.success/g, 'colors.secondary')
    .replace(/backgroundColor:\s*'#F8FAFC'/g, 'backgroundColor: colors.surface')
    .replace(/backgroundColor:\s*'#f8fafc'/gi, 'backgroundColor: colors.surface')
    .replace(/borderColor:\s*'#E2E8F0'/g, 'borderColor: colors.border')
    .replace(/borderColor:\s*'#eee'/g, 'borderColor: colors.border')
    .replace(/color:\s*'#334155'/g, 'color: colors.text')
    .replace(/color:\s*'#475569'/g, 'color: colors.textSecondary')
    .replace(/color:\s*'#64748B'/g, 'color: colors.textSecondary')
    .replace(/color:\s*'#0F172A'/g, 'color: colors.text')
    .replace(/color:\s*'#666'/g, 'color: colors.textMuted')
    .replace(/backgroundColor:\s*'#eee'/g, 'backgroundColor: colors.border');
}

function findInsertPoint(content) {
  const fnMatch = content.match(/export (?:default )?function (\w+)/);
  if (!fnMatch) return null;
  const brace = content.indexOf('{', fnMatch.index + fnMatch[0].length);
  return brace + 1;
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('missing', filePath);
    return false;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('Colors')) {
    console.log('skip', path.relative(root, filePath));
    return false;
  }

  const blocks = extractStyleBlocks(content);
  const paths = themePaths(filePath);
  const needsThemeInJsx = /Colors\./.test(content.replace(/StyleSheet\.create[\s\S]*?\}\);/g, ''));

  for (const block of blocks) {
    content = content.slice(0, block.start) + content.slice(block.end);
  }

  content = content.replace(/import \{ Colors, ([^}]+) \} from '([^']+)';/, (_, rest, from) => {
    let cleaned = rest
      .replace(/Typography, /g, '')
      .replace(/, Typography/g, '')
      .replace(/, Typography, /g, ', ');
    return `import { ${cleaned.trim().replace(/^, |, $/g, '')} } from '${from}';`;
  });
  content = content.replace(/import \{ Colors \} from '([^']+)';?\n?/g, '');

  if (!content.includes('useThemedStyles')) {
    const themeLine = content.match(/import \{[^}]+\} from '[^']*theme';/);
    if (themeLine) {
      content = content.replace(
        themeLine[0],
        `${themeLine[0]}\nimport { useTheme } from '${paths.theme}';\nimport { useThemedStyles } from '${paths.hooks}';`
      );
    }
  } else if (!content.includes('useTheme') && needsThemeInJsx) {
    const themeLine = content.match(/import \{[^}]+\} from '[^']*theme';/);
    if (themeLine && !content.includes(paths.theme)) {
      content = content.replace(themeLine[0], `${themeLine[0]}\nimport { useTheme } from '${paths.theme}';`);
    }
  }

  const styleInits = blocks
    .map((b) => `  const ${b.name} = useThemedStyles(({ colors, typography }) => ${transformInner(b.inner)});`)
    .join('\n');

  const insertAt = findInsertPoint(content);
  if (!insertAt) {
    console.warn('no fn', filePath);
    return false;
  }

  let insert = '';
  if (needsThemeInJsx && !content.slice(insertAt, insertAt + 400).includes('useTheme()')) {
    insert += '\n  const { colors } = useTheme();';
  }
  if (styleInits && !content.slice(insertAt, insertAt + 800).includes('useThemedStyles')) {
    insert += '\n' + styleInits;
  }
  content = content.slice(0, insertAt) + insert + content.slice(insertAt);

  content = content.replace(/Colors\./g, 'colors.');
  content = content.replace(/colors\.success/g, 'colors.secondary');

  if (filePath.endsWith('_layout.tsx')) {
    content = content.replace(
      /import \{ Colors \} from '\.\.\/src\/theme';\n/,
      "import { useTheme } from '../src/context/ThemeContext';\n"
    );
    content = content.replace(/const styles = StyleSheet\.create\(\{[\s\S]*?\}\);/, '');
    const navInsert = content.indexOf('{', content.indexOf('function RootNavigator'));
    if (navInsert > 0 && !content.includes('useThemedStyles')) {
      const bootStyles =
        "  const styles = useThemedStyles(({ colors }) => ({\n    boot: {\n      flex: 1,\n      alignItems: 'center',\n      justifyContent: 'center',\n      backgroundColor: colors.primary,\n    },\n  }));\n";
      content = content.slice(0, navInsert + 1) + '\n' + bootStyles + content.slice(navInsert + 1);
      content = content.replace(/color={Colors\.white}/, 'color={colors.white}');
    }
  }

  fs.writeFileSync(filePath, content);
  console.log('ok', path.relative(root, filePath), blocks.map((b) => b.name).join(', '));
  return true;
}

for (const f of files) {
  try {
    processFile(f);
  } catch (e) {
    console.error('fail', f, e);
  }
}
