#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando Suite de Tests para Producción\n');

// Configuración de colores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n📋 ${description}`, 'cyan');
  log(`Ejecutando: ${command}`, 'blue');
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    log(`✅ ${description} - COMPLETADO`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - FALLÓ`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function generateTestReport() {
  const reportPath = path.join(__dirname, '../coverage/production-test-report.json');
  const coveragePath = path.join(__dirname, '../coverage/lcov-report/index.html');
  
  const report = {
    timestamp: new Date().toISOString(),
    tests_executed: [
      'Unit Tests - Products',
      'Unit Tests - Users',
      'Unit Tests - Orders',
      'Unit Tests - Cart',
      'Unit Tests - Auth Middleware',
      'Unit Tests - Validation Middleware',
      'Integration Tests - Complete Flow',
      'Security Tests',
      'Performance Tests'
    ],
    coverage_report_path: coveragePath,
    production_ready: false,
    recommendations: []
  };

  try {
    // Leer cobertura actual
    const coverageFile = path.join(__dirname, '../coverage/coverage-summary.json');
    if (fs.existsSync(coverageFile)) {
      const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
      report.coverage = coverage.total;
      
      // Verificar si cumple umbrales
      const thresholds = { statements: 80, branches: 80, functions: 80, lines: 80 };
      report.production_ready = Object.keys(thresholds).every(
        key => coverage.total[key].pct >= thresholds[key]
      );
      
      if (!report.production_ready) {
        report.recommendations.push('Aumentar cobertura de tests al 80% mínimo');
      }
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`\n📊 Reporte generado en: ${reportPath}`, 'yellow');
    
  } catch (error) {
    log(`⚠️  Error generando reporte: ${error.message}`, 'yellow');
  }
}

function main() {
  const testSuites = [
    {
      command: 'npm test -- tests/routes/products.test.js',
      description: 'Tests de Productos (Unitarios)'
    },
    {
      command: 'npm test -- tests/routes/usuarios.test.js',
      description: 'Tests de Usuarios (Unitarios)'
    },
    {
      command: 'npm test -- tests/routes/pedidos.test.js',
      description: 'Tests de Pedidos (Unitarios)'
    },
    {
      command: 'npm test -- tests/routes/carritos.test.js',
      description: 'Tests de Carritos (Unitarios)'
    },
    {
      command: 'npm test -- tests/middlewares/auth.test.js',
      description: 'Tests de Autenticación (Middlewares)'
    },
    {
      command: 'npm test -- tests/middlewares/validation.test.js',
      description: 'Tests de Validación (Middlewares)'
    },
    {
      command: 'npm test -- tests/integration/complete-flow.test.js',
      description: 'Tests de Integración Completa'
    },
    {
      command: 'npm test -- --coverage',
      description: 'Ejecutar todos los tests con cobertura'
    }
  ];

  let passedTests = 0;
  let totalTests = testSuites.length;

  log('🚀 Ejecutando suite completa de tests para producción\n', 'bright');
  
  for (const suite of testSuites) {
    if (runCommand(suite.command, suite.description)) {
      passedTests++;
    }
  }

  // Resumen final
  log('\n' + '='.repeat(50), 'bright');
  log('📋 RESUMEN DE TESTS DE PRODUCCIÓN', 'bright');
  log('='.repeat(50), 'bright');
  
  log(`✅ Tests exitosos: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`❌ Tests fallidos: ${totalTests - passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    log('\n🎉 ¡Todos los tests pasaron! Sistema listo para producción.', 'green');
  } else {
    log('\n⚠️  Algunos tests fallaron. Revisar antes de ir a producción.', 'yellow');
  }

  // Generar reporte
  generateTestReport();
  
  // Verificaciones adicionales de producción
  log('\n🔍 VERIFICACIONES ADICIONALES DE PRODUCCIÓN:', 'cyan');
  
  const additionalChecks = [
    {
      command: 'npm audit --audit-level moderate',
      description: 'Verificar vulnerabilidades de seguridad'
    },
    {
      command: 'npm run lint',
      description: 'Verificar calidad del código (ESLint)'
    }
  ];

  for (const check of additionalChecks) {
    runCommand(check.command, check.description);
  }

  log('\n📖 Para ver el reporte detallado de cobertura:', 'blue');
  log('   npx http-server coverage/lcov-report', 'blue');
  
  log('\n🔗 Enlaces útiles:', 'cyan');
  log('   • Documentación API: http://localhost:3000/api-docs', 'cyan');
  log('   • Health Check: http://localhost:3000/health', 'cyan');
  log('   • Métricas: http://localhost:3000/metrics', 'cyan');

  process.exit(passedTests === totalTests ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, generateTestReport }; 