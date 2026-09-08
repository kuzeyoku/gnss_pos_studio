const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const webDir = path.join(__dirname, '..', 'web');

// 1. Modülleri yükle ve sınıfların metodlarını çıkar
const modules = {
  geodesyEngine: path.join(webDir, 'js', 'modules', 'geodesyEngine.js'),
  rinexPowerEngine: path.join(webDir, 'js', 'modules', 'rinexPowerEngine.js'),
  paftaIndexEngine: path.join(webDir, 'js', 'modules', 'paftaIndexEngine.js'),
  droneDatabase: path.join(webDir, 'js', 'modules', 'droneDatabase.js'),
  flightPlannerEngine: path.join(webDir, 'js', 'modules', 'flightPlannerEngine.js'),
  gnssFormatEngine: path.join(webDir, 'js', 'modules', 'gnssFormatEngine.js'),
  tg20GeoidEngine: path.join(webDir, 'js', 'modules', 'tg20GeoidEngine.js'),
  rw5CadastreModule: path.join(webDir, 'js', 'modules', 'rw5CadastreModule.js')
};

const classMethods = {};

for (const [modName, filePath] of Object.entries(modules)) {
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  const ast = parser.parse(content, { sourceType: 'script' });
  
  traverse(ast, {
    ClassDeclaration(p) {
      const clsName = p.node.id?.name;
      classMethods[clsName] = new Set();
      p.traverse({
        ClassMethod(mPath) {
          if (mPath.node.key?.name) {
            classMethods[clsName].add(mPath.node.key.name);
          }
        }
      });
    }
  });
}

console.log('=== DEFINED CLASS METHODS ===');
for (const [cls, methods] of Object.entries(classMethods)) {
  console.log(`${cls} (${methods.size} methods):`, Array.from(methods).join(', '));
}

// 2. app.js içindeki çağrıları tara
const appJsPath = path.join(webDir, 'js', 'app.js');
const appContent = fs.readFileSync(appJsPath, 'utf8');
const appAst = parser.parse(appContent, { sourceType: 'script' });

const methodCalls = {
  gnssEngine: new Set(),
  geodesyEngine: new Set(),
  rinexEngine: new Set(),
  paftaEngine: new Set(),
  tg20Engine: new Set(),
  flightEngine: new Set(),
  droneDatabase: new Set()
};

const rawMemberCalls = new Set();

traverse(appAst, {
  CallExpression(p) {
    const callee = p.node.callee;
    if (callee.type === 'MemberExpression') {
      const propName = callee.property?.name;
      
      // state.xxx.method()
      if (callee.object?.type === 'MemberExpression' && callee.object.object?.name === 'state') {
        const engineName = callee.object.property?.name;
        if (engineName && propName) {
          if (!methodCalls[engineName]) methodCalls[engineName] = new Set();
          methodCalls[engineName].add(propName);
        }
      }
      // window.DroneDatabase.method()
      else if (callee.object?.type === 'MemberExpression' && callee.object.property?.name === 'DroneDatabase') {
        if (propName) methodCalls.droneDatabase.add(propName);
      }
      else if (propName) {
        rawMemberCalls.add(propName);
      }
    }
  }
});

console.log('\n=== APP.JS METHOD INVOCATIONS BY ENGINE ===');
for (const [eng, calls] of Object.entries(methodCalls)) {
  console.log(`state.${eng} calls:`, Array.from(calls).join(', '));
}

// 3. Eşleştirme ve Hata Kontrolü
const engineToClass = {
  gnssEngine: 'GnssFormatEngine',
  geodesyEngine: 'GeodesyEngine',
  rinexEngine: 'RinexPowerEngine',
  paftaEngine: 'PaftaIndexEngine',
  tg20Engine: 'Tg20GeoidEngine',
  flightEngine: 'FlightPlannerEngine',
  droneDatabase: 'DroneDatabaseManager'
};

console.log('\n=== AUDIT RESULTS: COMPATIBILITY CHECK ===');
let hasMismatch = false;

const validEngines = Object.keys(engineToClass);
for (const eng of validEngines) {
  const clsName = engineToClass[eng];
  const calls = methodCalls[eng] || new Set();
  const defined = classMethods[clsName];
  
  if (!defined) {
    console.log(`❌ ERROR: Class '${clsName}' not found!`);
    hasMismatch = true;
    continue;
  }
  
  for (const calledMethod of calls) {
    if (!defined.has(calledMethod)) {
      console.log(`❌ ERROR: state.${eng}.${calledMethod}() is called in app.js, BUT '${calledMethod}' is NOT defined in class ${clsName}!`);
      hasMismatch = true;
    } else {
      console.log(`✅ OK: state.${eng}.${calledMethod}() matches ${clsName}.${calledMethod}`);
    }
  }
}

// 4. index.html DOM ID Kontrolü
const htmlPath = path.join(webDir, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const idRegex = /id=["']([^"']+)["']/g;
const htmlIds = new Set();
let match;
while ((match = idRegex.exec(htmlContent)) !== null) {
  htmlIds.add(match[1]);
}

console.log(`\n=== DOM ID AUDIT ===`);
console.log(`Found ${htmlIds.size} unique IDs in index.html.`);

const getElementByIdCalls = new Set();
traverse(appAst, {
  CallExpression(p) {
    if (p.node.callee?.property?.name === 'getElementById') {
      const arg = p.node.arguments[0];
      if (arg && arg.type === 'StringLiteral') {
        getElementByIdCalls.add(arg.value);
      }
    }
  }
});

let missingIds = 0;
for (const id of getElementByIdCalls) {
  if (!htmlIds.has(id)) {
    console.log(`⚠️ DOM ID Warning: getElementById("${id}") used in app.js, but NOT found in index.html!`);
    missingIds++;
  }
}

if (missingIds === 0) {
  console.log(`✅ All ${getElementByIdCalls.size} getElementById calls matched existing HTML elements!`);
}

if (!hasMismatch) {
  console.log('\n🎉 ALL MODULE METHOD INVOCATIONS ARE 100% COMPATIBLE!');
} else {
  console.log('\n❌ MISMATCHES DETECTED - FIXES REQUIRED!');
}
