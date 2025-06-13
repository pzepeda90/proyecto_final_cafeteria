# 🏗️ RESPONSABILIDADES POR CAPA - GUÍA DEFINITIVA

## 🎮 **PRESENTATION LAYER (Controllers)**

### ✅ **LO QUE SÍ DEBE HACER:**
- Extraer datos del request HTTP
- Validar formato de entrada (no lógica de negocio)
- Llamar al servicio correspondiente
- Formatear respuesta HTTP
- Manejar códigos de estado HTTP
- Transformar excepciones a respuestas HTTP

### ❌ **LO QUE NO DEBE HACER:**
- Lógica de negocio (ej: calcular precios, validar stock)
- Acceso directo a base de datos
- Validaciones complejas de dominio
- Transformaciones de datos complejas
- Decisiones de autorización complejas

### 📝 **EJEMPLO PRÁCTICO:**
```typescript
// ✅ CORRECTO
async createProduct(req: Request, res: Response) {
  const userId = req.user.id;
  const productData = req.body;
  
  const product = await this.productService.createProduct(userId, productData);
  
  res.status(201).json({ data: product });
}

// ❌ INCORRECTO  
async createProduct(req: Request, res: Response) {
  // ❌ Validación de negocio en controller
  if (req.body.price <= 0) throw new Error('Precio inválido');
  
  // ❌ Lógica de autorización compleja
  const user = await UserService.findById(req.user.id);
  if (user.role === 'seller' && user.shopId !== req.body.shopId) {
    throw new Error('No autorizado');
  }
  
  // ❌ Acceso directo a BD
  const product = await Product.create(req.body);
}
```

---

## 🧠 **BUSINESS LOGIC LAYER (Services)**

### ✅ **LO QUE SÍ DEBE HACER:**
- Implementar reglas de negocio
- Coordinar operaciones entre repositories
- Validar datos de dominio
- Aplicar políticas de autorización
- Manejar transacciones complejas
- Calcular valores derivados
- Ejecutar workflows de negocio

### ❌ **LO QUE NO DEBE HACER:**
- Conocer detalles HTTP (req, res, headers)
- Acceso directo a BD (usar repositories)
- Formatear respuestas para cliente
- Manejar errores de infraestructura
- Conocer detalles de implementación de datos

### 📝 **EJEMPLO PRÁCTICO:**
```typescript
// ✅ CORRECTO
class ProductService {
  async createProduct(userId: string, productData: CreateProductDto): Promise<Product> {
    // ✅ Validación de negocio
    await this.validateBusinessRules(productData);
    
    // ✅ Autorización de dominio
    const canCreate = await this.canUserCreateProduct(userId);
    if (!canCreate) throw new ForbiddenError();
    
    // ✅ Transformación de dominio
    const processedData = await this.applyBusinessLogic(productData);
    
    // ✅ Coordinación de repositories
    return await this.productRepository.create(processedData);
  }
  
  private async validateBusinessRules(data: CreateProductDto): Promise<void> {
    // Reglas específicas del dominio
    if (data.price <= 0) throw new ValidationError('Precio debe ser positivo');
    if (data.stock < 0) throw new ValidationError('Stock no puede ser negativo');
  }
}

// ❌ INCORRECTO
class ProductService {
  async createProduct(req: Request, res: Response) {
    // ❌ Conoce HTTP
    const data = req.body;
    
    // ❌ Acceso directo a BD
    const product = await Product.create(data);
    
    // ❌ Formateo de respuesta HTTP
    res.json(product);
  }
}
```

---

## 📦 **DATA ACCESS LAYER (Repositories)**

### ✅ **LO QUE SÍ DEBE HACER:**
- Encapsular acceso a datos
- Construir queries optimizadas
- Manejar paginación
- Implementar cache strategies
- Mapear entre modelos BD y entidades dominio
- Optimizar N+1 queries
- Manejar conexiones BD

### ❌ **LO QUE NO DEBE HACER:**
- Lógica de negocio
- Validaciones de dominio
- Autorización
- Transformaciones complejas de datos
- Conocer sobre HTTP o usuarios

### 📝 **EJEMPLO PRÁCTICO:**
```typescript
// ✅ CORRECTO
class ProductRepository {
  async findAll(filters: ProductFilters, pagination: Pagination): Promise<Product[]> {
    // ✅ Query optimizada
    const products = await this.orm.Product.findAll({
      where: this.buildWhereClause(filters),
      include: this.getOptimizedIncludes(), // Sin N+1
      limit: pagination.limit,
      offset: pagination.offset,
      order: [['createdAt', 'DESC']]
    });
    
    // ✅ Mapeo a entidades de dominio
    return products.map(p => this.mapToProduct(p));
  }
  
  private getOptimizedIncludes() {
    // ✅ Includes que evitan N+1
    return [
      { model: 'Category', attributes: ['id', 'name'] },
      { model: 'ProductImage', separate: true }
    ];
  }
}

// ❌ INCORRECTO
class ProductRepository {
  async findAll(userId: string) {
    // ❌ Lógica de autorización en repository
    const user = await User.findById(userId);
    if (user.role !== 'admin') throw new Error('No autorizado');
    
    // ❌ Query N+1
    const products = await Product.findAll({
      include: [Category, Seller, ProductImage] // N+1 problem
    });
    
    // ❌ Transformación de negocio
    return products.map(p => ({
      ...p,
      displayPrice: p.price * 1.16 // Cálculo de negocio
    }));
  }
}
```

---

## 💾 **INFRASTRUCTURE LAYER**

### ✅ **LO QUE SÍ DEBE HACER:**
- Configuración de BD
- Conexiones externas (APIs, cache)
- File storage
- Logging y monitoring
- Configuración de entorno
- Implementaciones concretas de interfaces

### ❌ **LO QUE NO DEBE HACER:**
- Lógica de negocio
- Conocer sobre dominios específicos
- Validaciones de datos

---

## 🎯 **REGLA DE ORO: DEPENDENCY RULE**

```
🎮 Presentation → 🧠 Business → 📦 Data → 💾 Infrastructure
    ↑              ↑           ↑           ↑
    │              │           │           │
Solo conoce →  Solo conoce → Solo conoce →  No conoce
la siguiente     la siguiente  la siguiente   capas superiores
```

### **✅ DEPENDENCIAS PERMITIDAS:**
- Controller → Service ✅
- Service → Repository ✅
- Repository → Infrastructure ✅

### **❌ DEPENDENCIAS PROHIBIDAS:**
- Service → Controller ❌
- Repository → Service ❌  
- Infrastructure → Repository ❌

---

## 🧪 **TESTING POR CAPAS**

### **🎮 Controller Tests:**
```typescript
// Solo testear HTTP handling
describe('ProductController', () => {
  it('should return 201 when product created', async () => {
    // Mock del service
    const mockService = { createProduct: jest.fn().mockResolvedValue(mockProduct) };
    
    const controller = new ProductController(mockService);
    const result = await controller.createProduct(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockService.createProduct).toHaveBeenCalledWith(userId, productData);
  });
});
```

### **🧠 Service Tests:**
```typescript
// Testear lógica de negocio pura
describe('ProductService', () => {
  it('should throw error when price is negative', async () => {
    const service = new ProductService(mockRepository, mockUserService);
    
    await expect(
      service.createProduct(userId, { ...validData, price: -10 })
    ).rejects.toThrow('Precio debe ser positivo');
  });
});
```

### **📦 Repository Tests:**
```typescript
// Testear queries y mapeo
describe('ProductRepository', () => {
  it('should find products with optimized includes', async () => {
    const repository = new ProductRepository(mockOrm);
    
    await repository.findAll(filters, pagination);
    
    expect(mockOrm.Product.findAll).toHaveBeenCalledWith({
      include: expect.arrayContaining([
        expect.objectContaining({ model: 'Category' })
      ])
    });
  });
});
```

---

## 🎯 **CONCLUSIÓN: CÓMO APLICARLO**

1. **ANTES DE ESCRIBIR CÓDIGO**: Define qué hace cada capa
2. **DURANTE DESARROLLO**: Pregúntate "¿Esta lógica pertenece aquí?"
3. **EN CODE REVIEW**: Verifica que cada capa tenga una sola responsabilidad
4. **AL TESTEAR**: Cada capa se testea independientemente

**Si sigues estas reglas, tu arquitectura será escalable y mantenible.** 