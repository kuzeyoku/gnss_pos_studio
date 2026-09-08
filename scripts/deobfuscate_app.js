const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const targetFilePath = path.join(__dirname, '..', 'web', 'js', 'app.js');
console.log('Reading:', targetFilePath);
const code = fs.readFileSync(targetFilePath, 'utf8');

const ast = parser.parse(code, {
  sourceType: 'script',
  allowReturnOutsideFunction: true
});

let renamedCount = 0;

// Scope-aware variable renaming
traverse(ast, {
  Scope(path) {
    const bindings = path.scope.bindings;
    let localCounter = 1;

    for (const name in bindings) {
      if (/^_0x[a-f0-9]+$/i.test(name)) {
        const binding = bindings[name];
        let newName = '';

        // 1. Parametre ise
        if (binding.kind === 'param') {
          const parentNode = binding.path.parent;
          if (parentNode && (parentNode.type === 'ArrowFunctionExpression' || parentNode.type === 'FunctionExpression')) {
            const grandParent = binding.path.parentPath?.parent;
            if (grandParent && grandParent.type === 'CallExpression' && grandParent.callee?.property?.name === 'addEventListener') {
              newName = 'event';
            } else if (grandParent && grandParent.type === 'CallExpression' && ['forEach', 'map', 'filter', 'some', 'every', 'find'].includes(grandParent.callee?.property?.name)) {
              const paramIdx = binding.path.key;
              if (paramIdx === 0) newName = 'item';
              else if (paramIdx === 1) newName = 'idx';
              else newName = 'arr';
            }
          }
          if (!newName) {
            newName = `arg${localCounter++}`;
          }
        }

        // 2. Catch parametresi ise
        if (binding.kind === 'catch') {
          newName = 'err';
        }

        // 3. Değişken tanımı (var, let, const)
        if (!newName) {
          const init = binding.path.node.init;
          if (init) {
            if (init.type === 'CallExpression') {
              const callee = init.callee;
              const fnName = callee.property?.name || callee.name || '';
              
              if (fnName === 'getElementById' || fnName === 'querySelector') {
                const arg0 = init.arguments[0]?.value || '';
                if (arg0.toLowerCase().includes('btn')) newName = 'btnEl';
                else if (arg0.toLowerCase().includes('modal')) newName = 'modalEl';
                else if (arg0.toLowerCase().includes('input')) newName = 'inputEl';
                else if (arg0.toLowerCase().includes('table')) newName = 'tableEl';
                else if (arg0.toLowerCase().includes('map')) newName = 'mapEl';
                else newName = 'domEl';
              } else if (fnName === 'createElement') {
                const tag = init.arguments[0]?.value || 'div';
                newName = `${tag}El`;
              } else if (fnName === 'querySelectorAll') {
                newName = 'elementsList';
              } else if (fnName === 'json') {
                newName = 'jsonData';
              } else if (fnName === 'text') {
                newName = 'textData';
              } else if (fnName === 'split') {
                newName = 'parts';
              } else if (fnName === 'match') {
                newName = 'match';
              }
            } else if (init.type === 'ArrayExpression') {
              newName = 'items';
            } else if (init.type === 'ObjectExpression') {
              newName = 'obj';
            } else if (init.type === 'NumericLiteral') {
              newName = 'num';
            } else if (init.type === 'StringLiteral') {
              newName = 'str';
            } else if (init.type === 'BooleanLiteral') {
              newName = 'flag';
            }
          }
        }

        // Genel yedek isim
        if (!newName) {
          newName = `v_${localCounter++}`;
        }

        // İsim çakışması kontrolü
        let finalName = newName;
        let suffix = 1;
        while (path.scope.hasBinding(finalName) || path.scope.hasGlobal(finalName)) {
          finalName = `${newName}_${suffix++}`;
        }

        try {
          path.scope.rename(name, finalName);
          renamedCount++;
        } catch (e) {
          // Atla
        }
      }
    }
  }
});

console.log(`Renamed ${renamedCount} hex variables.`);

const output = generate(ast, {
  retainLines: false,
  compact: false,
  concise: false,
  comments: true
}, code);

fs.writeFileSync(targetFilePath, output.code, 'utf8');

const backupPath = path.join(__dirname, '..', 'web_dev_source_backup', 'js', 'app.js');
fs.writeFileSync(backupPath, output.code, 'utf8');

console.log('Successfully wrote deobfuscated app.js to both locations!');
