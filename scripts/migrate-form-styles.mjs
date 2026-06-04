import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const files = [
  'src/components/activities/HumanPerformanceExperiment.tsx',
  'src/components/activities/HumanPerformanceForm.tsx',
  'src/components/activities/ParachuteDropForm.tsx',
  'src/components/activities/SoundPollutionForm.tsx',
  'src/components/activities/BreathingPaceForm.tsx',
  'src/components/activities/EarthquakeForm.tsx',
  'src/components/activities/ReactionBoardForm.tsx',
  'src/components/activities/BreathingPaceExperiment.tsx',
  'src/components/activities/HandFanForm.tsx',
].map((f) => path.join(root, f));

function migrate(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  if (!c.includes('const styles = StyleSheet.create')) return;

  const start = c.lastIndexOf('const styles = StyleSheet.create');
  let depth = 0;
  let i = c.indexOf('{', start);
  for (; i < c.length; i++) {
    if (c[i] === '{') depth++;
    else if (c[i] === '}') {
      depth--;
      if (depth === 0) {
        i = c.indexOf(');', i) + 2;
        break;
      }
    }
  }
  let styleBody = c.slice(start + 'const styles = StyleSheet.create'.length, i);
  styleBody = styleBody
    .replace(/Colors\./g, 'colors.')
    .replace(/Typography\./g, 'typography.')
    .replace(/colors\.success/g, 'colors.secondary')
    .replace(/backgroundColor:\s*'#F8FAFC'/g, 'backgroundColor: colors.surface')
    .replace(/backgroundColor:\s*colors\.white/g, 'backgroundColor: colors.surface')
    .replace(/borderColor:\s*'#E2E8F0'/g, 'borderColor: colors.border')
    .replace(/color:\s*'#334155'/g, 'color: colors.text')
    .replace(/color:\s*'#475569'/g, 'color: colors.textSecondary')
    .replace(/color:\s*'#854d0e'/g, 'color: colors.text');

  c = c.slice(0, start) + c.slice(i);

  c = c.replace(/import \{ Colors, ([^}]+)\} from '\.\.\/\.\.\/theme';/, "import { $1 } from '../../theme';\nimport { useThemedStyles } from '../../hooks/useThemedStyles';");

  const exportIdx = c.search(/export function \w+/);
  const brace = c.indexOf('{', exportIdx);
  const inject = `\n  const styles = useThemedStyles(({ colors, typography }) => (${styleBody}));\n`;
  if (!c.slice(brace, brace + 200).includes('useThemedStyles')) {
    c = c.slice(0, brace + 1) + inject + c.slice(brace + 1);
  }

  c = c.replace(/Colors\./g, 'colors.');
  c = c.replace(/colors\.success/g, 'colors.secondary');

  fs.writeFileSync(filePath, c);
  console.log('ok', path.basename(filePath));
}

for (const f of files) {
  try {
    migrate(f);
  } catch (e) {
    console.error('fail', f, e.message);
  }
}
