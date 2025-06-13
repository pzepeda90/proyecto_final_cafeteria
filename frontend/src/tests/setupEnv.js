import React from 'react';
import '@testing-library/jest-dom';

// Mock de variables de entorno de Vite para tests
process.env.VITE_API_BASE_URL = 'http://localhost:3000/api';
process.env.NODE_ENV = 'test';

// Mock de import.meta.env
global.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
      MODE: 'test'
    }
  }
};

// Mock de fetch para tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock de las variables de entorno para los tests
process.env.VITE_APP_NAME = 'Cafetería';
process.env.VITE_APP_VERSION = '1.0.0';

// Mock del módulo apiEndpoints para Jest
jest.mock('../constants/apiEndpoints', () => {
  const testEndpoints = require('../constants/apiEndpoints.test.js');
  return testEndpoints;
}); 