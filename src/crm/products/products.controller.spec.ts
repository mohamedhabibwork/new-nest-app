import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: jest.Mocked<ProductsService>;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'Product Name',
      sku: 'SKU-001',
      price: 99.99,
      isActive: true,
    };

    it('should create a product successfully', async () => {
      const mockProduct = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'Product Name',
        sku: 'SKU-001',
        price: 99.99,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createDto);

      expect(productsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException when SKU already exists', async () => {
      productsService.create.mockRejectedValue(
        new BadRequestException('Product with this SKU already exists'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            name: 'Product Name',
            sku: 'SKU-001',
            price: 99.99,
          },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      productsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 50, true);

      expect(productsService.findAll).toHaveBeenCalledWith(1, 50, true);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered products by active status', async () => {
      const mockResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };

      productsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 50, false);

      expect(productsService.findAll).toHaveBeenCalledWith(1, 50, false);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return product by ID', async () => {
      const mockProduct = {
        id: productId,
        name: 'Product Name',
        sku: 'SKU-001',
        price: 99.99,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(productId);

      expect(productsService.findOne).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      productsService.findOne.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.findOne(productId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateProductDto = {
      name: 'Updated Product Name',
      price: 149.99,
    };

    it('should update product successfully', async () => {
      const mockProduct = {
        id: productId,
        name: 'Updated Product Name',
        sku: 'SKU-001',
        price: 149.99,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsService.update.mockResolvedValue(mockProduct);

      const result = await controller.update(productId, updateDto);

      expect(productsService.update).toHaveBeenCalledWith(productId, updateDto);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      productsService.update.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.update(productId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete product successfully', async () => {
      productsService.remove.mockResolvedValue({
        message: 'Product deleted successfully',
      });

      const result = await controller.remove(productId);

      expect(productsService.remove).toHaveBeenCalledWith(productId);
      expect(result).toEqual({ message: 'Product deleted successfully' });
    });

    it('should throw NotFoundException when product not found', async () => {
      productsService.remove.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.remove(productId)).rejects.toThrow(NotFoundException);
    });
  });
});

