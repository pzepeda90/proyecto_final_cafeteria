// 🛠️ HERRAMIENTAS DE VALIDACIÓN ARQUITECTÓNICA
// Ejecutar: node architecture-tooling-setup.js

const fs = require('fs');
const path = require('path');

// 1. Package.json con scripts de validación
const validationScripts = {
  "scripts": {
    // Validación de arquitectura
    "validate:architecture": "madge --circular src/ && complexity-report src/",
    "validate:dependencies": "madge --circular --warning src/",
    "validate:complexity": "complexity-report src/ --threshold 10",
    
    // Análisis de código
    "analyze:bundle": "webpack-bundle-analyzer dist/main.js",
    "analyze:coverage": "jest --coverage --silent",
    "analyze:dependencies": "madge --image deps.png src/",
    
    // Performance profiling
    "profile:memory": "node --inspect scripts/memory-profile.js",
    "profile:queries": "node scripts/query-profiler.js",
    
    // Pre-commit validations
    "pre-commit": "npm run validate:architecture && npm run test:unit",
    
    // Tests arquitectónicos específicos
    "test:architecture": "jest tests/architecture/",
    "test:contracts": "jest tests/contracts/",
    "test:performance": "jest tests/performance/"
  }
};

// 2. Configuración de ESLint para arquitectura
const eslintArchitectureRules = {
  "rules": {
    // Prevenir importaciones directas entre capas
    "import/no-restricted-paths": [
      "error",
      {
        "zones": [
          {
            "target": "./src/controllers",
            "from": "./src/repositories",
            "message": "Controllers no deben importar repositories directamente"
          },
          {
            "target": "./src/services", 
            "from": "./src/controllers",
            "message": "Services no deben importar controllers"
          }
        ]
      }
    ],
    
    // Límites de complejidad
    "complexity": ["error", 10],
    "max-lines-per-function": ["error", 50],
    "max-lines": ["error", 300]
  }
};

// 3. Jest config para tests arquitectónicos
const jestArchitectureConfig = {
  "projects": [
    {
      "displayName": "unit",
      "testMatch": ["<rootDir>/tests/unit/**/*.test.js"]
    },
    {
      "displayName": "integration", 
      "testMatch": ["<rootDir>/tests/integration/**/*.test.js"],
      "setupFilesAfterEnv": ["<rootDir>/tests/integration/setup.js"]
    },
    {
      "displayName": "architecture",
      "testMatch": ["<rootDir>/tests/architecture/**/*.test.js"]
    }
  ]
};

// 4. Tests arquitectónicos de ejemplo
const architectureTests = `
// tests/architecture/layering.test.js
const fs = require('fs');
const path = require('path');

describe('Architecture Layering', () => {
  test('Controllers should not import repositories directly', () => {
    const controllerFiles = getFilesInDir('src/controllers');
    
    controllerFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toMatch(/require.*repositories/);
      expect(content).not.toMatch(/import.*repositories/);
    });
  });
  
  test('Services should not have HTTP dependencies', () => {
    const serviceFiles = getFilesInDir('src/services');
    
    serviceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toMatch(/express|req\.|res\./);
    });
  });
  
  test('No circular dependencies', async () => {
    const madge = require('madge');
    const result = await madge('src/');
    expect(result.circular()).toHaveLength(0);
  });
});

function getFilesInDir(dir) {
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(dir, file));
}
`;

// 5. Query profiler para detectar N+1
const queryProfiler = `
// scripts/query-profiler.js
const { Sequelize } = require('sequelize');

// Hook into Sequelize to log all queries
const originalQuery = Sequelize.prototype.query;
const queries = [];

Sequelize.prototype.query = function(sql, options) {
  const start = Date.now();
  
  return originalQuery.call(this, sql, options).then(result => {
    const duration = Date.now() - start;
    queries.push({ sql, duration, timestamp: new Date() });
    
    // Detect potential N+1
    if (queries.length > 1) {
      const lastQuery = queries[queries.length - 1];
      const prevQuery = queries[queries.length - 2];
      
      if (similarQueries(lastQuery.sql, prevQuery.sql)) {
        console.warn('🚨 Potential N+1 Query detected:', lastQuery.sql);
      }
    }
    
    return result;
  });
};

function similarQueries(sql1, sql2) {
  // Simple heuristic para detectar queries similares
  const normalize = sql => sql.replace(/\d+/g, '?').toLowerCase();
  return normalize(sql1) === normalize(sql2);
}

module.exports = { queries };
`;

// 6. Complexity reporter config
const complexityConfig = {
  "complexity-report": {
    "threshold": 10,
    "format": "json",
    "output": "complexity-report.json"
  }
};

// Crear archivos
console.log('🚀 Configurando herramientas de validación arquitectónica...');

// Actualizar package.json
const packagePath = './package.json';
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  pkg.scripts = { ...pkg.scripts, ...validationScripts.scripts };
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log('✅ Scripts de validación agregados a package.json');
}

// Crear tests arquitectónicos
const testsDir = './tests/architecture';
if (!fs.existsSync(testsDir)) {
  fs.mkdirSync(testsDir, { recursive: true });
}
fs.writeFileSync(path.join(testsDir, 'layering.test.js'), architectureTests);
console.log('✅ Tests arquitectónicos creados');

// Crear query profiler
const scriptsDir = './scripts';
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}
fs.writeFileSync(path.join(scriptsDir, 'query-profiler.js'), queryProfiler);
console.log('✅ Query profiler creado');

console.log(`
🎯 PRÓXIMOS PASOS:

1. Instalar dependencias:
   npm install --save-dev madge complexity-report webpack-bundle-analyzer

2. Configurar pre-commit hooks:
   npx husky add .husky/pre-commit "npm run validate:architecture"

3. Ejecutar validaciones:
   npm run validate:architecture
   npm run test:architecture

4. Monitorear métricas:
   npm run analyze:bundle
   npm run profile:queries

✨ Tu próximo proyecto tendrá validación arquitectónica desde día 1!
`); 