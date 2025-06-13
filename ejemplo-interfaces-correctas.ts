// 🎯 EJEMPLO: INTERFACES CORRECTAS PARA TU PROYECTO DE CAFETERÍA

// ==========================================
// 1. DEFINIR INTERFACES/CONTRATOS PRIMERO
// ==========================================

// 📄 types/Product.ts
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  available: boolean;
  categoryId: string;
  sellerId: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  sellerId: string;
  images?: string[];
}

interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  available?: boolean;
  images?: string[];
}

interface ProductFilters {
  categoryId?: string;
  sellerId?: string;
  available?: boolean;
  search?: string;
  priceMin?: number;
  priceMax?: number;
}

// ==========================================
// 2. REPOSITORY INTERFACES (Acceso a Datos)
// ==========================================

// 📦 repositories/interfaces/IProductRepository.ts
interface IProductRepository {
  // Queries básicas
  findAll(filters?: ProductFilters, pagination?: Pagination): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByCategory(categoryId: string): Promise<Product[]>;
  findBySeller(sellerId: string): Promise<Product[]>;
  
  // Mutaciones
  create(product: CreateProductDto): Promise<Product>;
  update(id: string, updates: UpdateProductDto): Promise<Product>;
  delete(id: string): Promise<boolean>;
  
  // Operaciones específicas
  updateStock(id: string, quantity: number): Promise<void>;
  findLowStockProducts(threshold: number): Promise<Product[]>;
  
  // Performance queries
  findWithCategoriesOptimized(): Promise<Product[]>; // Sin N+1
  countByFilters(filters: ProductFilters): Promise<number>;
}

// ==========================================
// 3. SERVICE INTERFACES (Lógica de Negocio)
// ==========================================

// 🧠 services/interfaces/IProductService.ts
interface IProductService {
  // Operaciones de negocio
  getProductsForUser(userId: string, filters: ProductFilters): Promise<Product[]>;
  createProduct(userId: string, productData: CreateProductDto): Promise<Product>;
  updateProduct(userId: string, productId: string, updates: UpdateProductDto): Promise<Product>;
  deleteProduct(userId: string, productId: string): Promise<boolean>;
  
  // Reglas de negocio específicas
  canUserManageProduct(userId: string, productId: string): Promise<boolean>;
  validateProductData(productData: CreateProductDto): Promise<ValidationResult>;
  processStockUpdate(productId: string, quantity: number, reason: string): Promise<void>;
  
  // Operaciones complejas
  getProductRecommendations(userId: string): Promise<Product[]>;
  generateProductReport(sellerId: string, period: DateRange): Promise<ProductReport>;
}

// ==========================================
// 4. CONTROLLER INTERFACES (HTTP)
// ==========================================

// 🎮 controllers/interfaces/IProductController.ts
interface IProductController {
  getProducts(req: Request, res: Response): Promise<void>;
  getProduct(req: Request, res: Response): Promise<void>;
  createProduct(req: Request, res: Response): Promise<void>;
  updateProduct(req: Request, res: Response): Promise<void>;
  deleteProduct(req: Request, res: Response): Promise<void>;
}

// ==========================================
// 5. IMPLEMENTACIÓN CON INTERFACES
// ==========================================

// 📦 repositories/ProductRepository.ts
class ProductRepository implements IProductRepository {
  constructor(private orm: any) {} // Inyección de dependencia
  
  async findAll(filters?: ProductFilters, pagination?: Pagination): Promise<Product[]> {
    // Query optimizada con paginación
    const query = this.buildOptimizedQuery(filters);
    const products = await this.orm.Product.findAll({
      ...query,
      limit: pagination?.limit || 20,
      offset: pagination?.offset || 0,
      // Incluir relaciones SIN N+1
      include: this.getOptimizedIncludes()
    });
    
    return products.map(p => this.mapToProduct(p));
  }
  
  private buildOptimizedQuery(filters?: ProductFilters) {
    // Lógica de construcción de query optimizada
    const where: any = {};
    
    if (filters?.available !== undefined) where.available = filters.available;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }
    
    return { where };
  }
  
  private getOptimizedIncludes() {
    // Includes optimizados para evitar N+1
    return [
      { model: 'Category', attributes: ['id', 'name'] },
      { model: 'Seller', attributes: ['id', 'name'] },
      { model: 'ProductImage', separate: true } // Evita N+1 en imágenes
    ];
  }
}

// 🧠 services/ProductService.ts  
class ProductService implements IProductService {
  constructor(
    private productRepository: IProductRepository,
    private userService: IUserService,
    private logger: ILogger
  ) {}
  
  async createProduct(userId: string, productData: CreateProductDto): Promise<Product> {
    // 1. Validar permisos
    const canCreate = await this.canUserCreateProduct(userId);
    if (!canCreate) {
      throw new ForbiddenError('Usuario no puede crear productos');
    }
    
    // 2. Validar datos de negocio
    const validation = await this.validateProductData(productData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // 3. Aplicar reglas de negocio
    const processedData = await this.applyBusinessRules(userId, productData);
    
    // 4. Crear en repositorio
    const product = await this.productRepository.create(processedData);
    
    // 5. Log de auditoría
    await this.logger.logProductCreation(userId, product.id);
    
    return product;
  }
  
  private async canUserCreateProduct(userId: string): Promise<boolean> {
    const user = await this.userService.findById(userId);
    return user?.role === 'admin' || user?.role === 'seller';
  }
  
  private async applyBusinessRules(userId: string, productData: CreateProductDto): Promise<CreateProductDto> {
    // Reglas como: stock mínimo, precios válidos, etc.
    const processed = { ...productData };
    
    if (processed.stock < 0) processed.stock = 0;
    if (processed.price <= 0) throw new ValidationError('Precio debe ser positivo');
    
    return processed;
  }
}

// 🎮 controllers/ProductController.ts
class ProductController implements IProductController {
  constructor(
    private productService: IProductService,
    private errorHandler: IErrorHandler
  ) {}
  
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      // 1. Solo extraer datos HTTP
      const userId = req.user.id;
      const productData = req.body;
      
      // 2. Delegar TODO a servicio
      const product = await this.productService.createProduct(userId, productData);
      
      // 3. Solo formatear respuesta HTTP
      res.status(201).json({
        success: true,
        data: product,
        message: 'Producto creado exitosamente'
      });
      
    } catch (error) {
      // 4. Manejo centralizado de errores
      this.errorHandler.handleControllerError(error, req, res);
    }
  }
}

// ==========================================
// 6. DEPENDENCY INJECTION CONTAINER
// ==========================================

// 🔧 container.ts
class DIContainer {
  private static instance: DIContainer;
  private services = new Map();
  
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
  
  register<T>(token: string, implementation: T): void {
    this.services.set(token, implementation);
  }
  
  get<T>(token: string): T {
    return this.services.get(token);
  }
  
  // Setup de dependencias
  setupDependencies(): void {
    // Repositories
    this.register<IProductRepository>('ProductRepository', 
      new ProductRepository(orm)
    );
    
    // Services
    this.register<IProductService>('ProductService',
      new ProductService(
        this.get<IProductRepository>('ProductRepository'),
        this.get<IUserService>('UserService'),
        this.get<ILogger>('Logger')
      )
    );
    
    // Controllers
    this.register<IProductController>('ProductController',
      new ProductController(
        this.get<IProductService>('ProductService'),
        this.get<IErrorHandler>('ErrorHandler')
      )
    );
  }
}

// ==========================================
// 7. COMPARACIÓN: ANTES vs DESPUÉS  
// ==========================================

/*
❌ ANTES (Tu código actual):
- Controller hace validación + lógica de negocio + acceso a BD
- Service accede directamente al ORM
- No hay contratos claros
- Difícil de testear unitariamente
- Acoplamiento fuerte

✅ DESPUÉS (Con interfaces):
- Cada capa tiene responsabilidad única y clara
- Interfaces definen contratos explícitos
- Fácil testing con mocks
- Bajo acoplamiento, alta cohesión
- Escalable y mantenible
*/

export {
  IProductRepository,
  IProductService, 
  IProductController,
  ProductRepository,
  ProductService,
  ProductController,
  DIContainer
}; 