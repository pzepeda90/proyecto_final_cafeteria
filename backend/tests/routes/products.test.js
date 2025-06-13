const request = require('supertest');
const app = require('../../src/app');
const { Product } = require('../../src/models');

describe('Rutas de Productos', () => {
  beforeEach(async () => {
    await Product.destroy({ where: {} }); // Limpiar la tabla antes de cada test
  });

  describe('GET /api/productos', () => {
    test('debería obtener una lista vacía de productos', async () => {
      const response = await request(app)
        .get('/api/productos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('debería obtener una lista con productos', async () => {
      const testProduct = await Product.create({
        name: 'Café Americano',
        price: 2.5,
        description: 'Café negro tradicional',
        image: 'cafe-americano.jpg',
        category: 'bebidas',
        stock: 100
      });

      const response = await request(app)
        .get('/api/productos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(testProduct.name);
    });
  });

  describe('POST /api/productos', () => {
    test('debería crear un nuevo producto', async () => {
      const newProduct = {
        name: 'Café Latte',
        price: 3.5,
        description: 'Café con leche cremosa',
        image: 'cafe-latte.jpg',
        category: 'bebidas',
        stock: 50
      };

      const response = await request(app)
        .post('/api/productos')
        .send(newProduct)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.name).toBe(newProduct.name);
      expect(response.body.price).toBe(newProduct.price);

      // Verificar que se guardó en la base de datos
      const savedProduct = await Product.findByPk(response.body.id);
      expect(savedProduct).not.toBeNull();
      expect(savedProduct.name).toBe(newProduct.name);
    });

    test('debería fallar al crear un producto sin nombre', async () => {
      const invalidProduct = {
        price: 3.5,
        description: 'Café con leche cremosa',
        category: 'bebidas'
      };

      await request(app)
        .post('/api/productos')
        .send(invalidProduct)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
}); 