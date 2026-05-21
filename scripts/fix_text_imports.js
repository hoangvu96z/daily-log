const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walk(filePath);
      }
    } else if (filePath.endsWith('.tsx') && file !== 'AppText.tsx') {
      let content = fs.readFileSync(filePath, 'utf8');
      
      const regex = /import\s+\{([^\}]*?)\bText\b([^\}]*?)\}\s+from\s+['"]react-native['"];?/g;
      
      if (regex.test(content)) {
        console.log(`Processing ${filePath}`);
        content = content.replace(regex, (match, p1, p2) => {
          let newImports = (p1 + p2).replace(/,\s*,/g, ',').replace(/\{\s*,/, '{').replace(/,\s*\}/, '}').trim();
          let depth = filePath.split(path.sep).length - 2;
          
          if (filePath === 'App.tsx') depth = -1;
          
          let prefix = '';
          if (depth === -1) {
            prefix = './src/';
          } else if (depth === 0) {
            prefix = './';
          } else {
            prefix = '../'.repeat(depth);
          }
          
          let res = '';
          if (newImports && newImports !== ',' && newImports !== '') {
            if (newImports.startsWith(',')) newImports = newImports.substring(1);
            if (newImports.endsWith(',')) newImports = newImports.substring(0, newImports.length - 1);
            res += 'import { ' + newImports.trim() + ' } from \'react-native\';\n';
          }
          res += 'import { Text } from \'' + prefix + 'components/AppText\';';
          return res;
        });
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

walk('.');
