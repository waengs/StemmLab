import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'src/components/activities');

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.tsx')) continue;
  const filePath = path.join(dir, name);
  let c = fs.readFileSync(filePath, 'utf8');
  const broken = /export function (\w+)\(\{\s*\n\s*const styles = useThemedStyles\(\(\{ colors, typography \}\) => \(\(\{/;
  const m = c.match(broken);
  if (!m) continue;

  const fnName = m[1];
  const start = m.index + m[0].length - 1; // at {
  let depth = 0;
  let i = start;
  for (; i < c.length; i++) {
    if (c[i] === '{') depth++;
    else if (c[i] === '}') {
      depth--;
      if (depth === 0) {
        i = c.indexOf('});));', i);
        if (i === -1) {
          console.warn('no end', name);
          break;
        }
        i += '});));'.length;
        break;
      }
    }
  }
  const styleInner = c.slice(start, c.indexOf('});));', start));
  const afterStyles = c.slice(i).trimStart();
  const propsMatch = afterStyles.match(/^([\s\S]*?\}: [^)]+)\) \{/);
  if (!propsMatch) {
    console.warn('no props', name);
    continue;
  }
  const propsPart = propsMatch[1];
  const hookName = `use${fnName}Styles`;

  const before = c.slice(0, m.index);
  const rest = afterStyles.slice(propsMatch[0].length);

  const fixed =
    before +
    `function ${hookName}() {\n  return useThemedStyles(({ colors, typography }) => (${styleInner}));\n}\n\nexport function ${fnName}({\n${propsPart}) {\n  const styles = ${hookName}();\n` +
    rest;

  // Remove orphan meterStyles blocks that still use Typography
  let out = fixed.replace(
    /const meterStyles = StyleSheet\.create\(\{[\s\S]*?\}\);\s*\n/g,
    ''
  );

  fs.writeFileSync(filePath, out);
  console.log('fixed', name);
}
