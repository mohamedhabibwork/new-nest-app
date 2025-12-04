import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import {
  buildPaginationResponse,
  normalizePaginationParams,
} from '../../common/utils/pagination.util';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    // If SKU is provided, check for duplicates
    if (data.sku) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingProduct) {
        throw new BadRequestException('Product with this SKU already exists');
      }
    }

    const product = await this.prisma.product.create({
      data: withUlid({
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: data.price,
        currency: data.currency || 'USD',
        isActive: data.isActive !== undefined ? data.isActive : true,
      }),
    });

    return product;
  }

  async findAll(page?: number, limit?: number, isActive?: boolean) {
    const { page: normalizedPage, limit: normalizedLimit } =
      normalizePaginationParams(page, limit);

    const where: Prisma.ProductWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (normalizedPage - 1) * normalizedLimit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginationResponse(
      products,
      total,
      normalizedPage,
      normalizedLimit,
    );
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            dealProducts: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, data: UpdateProductDto) {
    await this.findOne(id);

    // If SKU is being updated, check for duplicates
    if (data.sku) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingProduct && existingProduct.id !== id) {
        throw new BadRequestException('Product with this SKU already exists');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: data.price,
        currency: data.currency,
        isActive: data.isActive,
      },
    });
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    // Check if product is used in deals
    const dealProductCount = await this.prisma.dealProduct.count({
      where: { productId: id },
    });

    if (dealProductCount > 0) {
      throw new BadRequestException('Cannot delete product used in deals');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }
}
