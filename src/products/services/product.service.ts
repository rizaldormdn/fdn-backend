import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { ProductRepository } from "../repositories/product.repository";
import { CreateProductDto } from "../dtos/create-product.dto";
import { UpdateProductDto } from "../dtos/update-product.dto";
import { RatingsService } from "src/ratings/services/rating.service";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly ratingsService: RatingsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async fetchAndStoreProducts() {
    try {
      const apiUrl = this.configService.get<string>("API_SOURCE_URL");
      if (!apiUrl) {
        this.logger.error("API_SOURCE_URL is not configured");
        throw new BadRequestException("API_SOURCE_URL is not configured");
      }
      this.logger.log(`Fetching products from ${apiUrl}`);

      // Fetch data dari API eksternal
      const response = await firstValueFrom(this.httpService.get(apiUrl));

      const fetchedProducts = response.data;

      if (!Array.isArray(fetchedProducts) || fetchedProducts.length === 0) {
        throw new BadRequestException("No products found from API");
      }

      // Prepare products data
      const productsToInsert = fetchedProducts.map((item) => ({
        product_id: item.id,
        name: item.title,
        price: item.price,
      }));

      // Prepare ratings data
      const ratingsToInsert = fetchedProducts
        .filter((item) => item.rating)
        .map((item) => ({
          product_id: item.id,
          rate: item.rating.rate,
          count: item.rating.count,
        }));

      const insertedProducts =
        await this.productRepository.bulkCreate(productsToInsert);

      const insertedRatings =
        await this.ratingsService.bulkCreateRatings(ratingsToInsert);

      this.logger.log(
        `Successfully inserted ${insertedProducts.length} products and ${insertedRatings.length} ratings`
      );

      return {
        products: insertedProducts,
        ratings: insertedRatings,
        summary: {
          totalFetched: fetchedProducts.length,
          productsInserted: insertedProducts.length,
          ratingsInserted: insertedRatings.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error fetching products: ${error.message}`,
        error.stack
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Failed to fetch and store products");
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const { data, total } = await this.productRepository.findAll(page, limit);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error finding all products: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.productRepository.findById(id);

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      this.logger.error(
        `Error finding product ${id}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async create(createProductDto: CreateProductDto) {
    try {
      // Check if product with same name exists
      const existingByName = await this.productRepository.findByName(
        createProductDto.name
      );

      if (existingByName) {
        throw new ConflictException(
          `Product with name "${createProductDto.name}" already exists`
        );
      }

      // Check if product with same product_id exists
      const existingById = await this.productRepository.findByProductId(
        createProductDto.product_id
      );

      if (existingById) {
        throw new ConflictException(
          `Product with product_id ${createProductDto.product_id} already exists`
        );
      }

      const product = await this.productRepository.create(createProductDto);
      this.logger.log(`Product created: ${product.id}`);

      return product;
    } catch (error) {
      this.logger.error(
        `Error creating product: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(id);

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Check if new name conflicts with another product
      if (updateProductDto.name) {
        const existingByName = await this.productRepository.findByName(
          updateProductDto.name
        );

        if (existingByName && existingByName.id !== id) {
          throw new ConflictException(
            `Product with name "${updateProductDto.name}" already exists`
          );
        }
      }

      // Check if new product_id conflicts with another product
      if (updateProductDto.product_id) {
        const existingById = await this.productRepository.findByProductId(
          updateProductDto.product_id
        );

        if (existingById && existingById.id !== id) {
          throw new ConflictException(
            `Product with product_id ${updateProductDto.product_id} already exists`
          );
        }
      }

      const updatedProduct = await this.productRepository.update(
        id,
        updateProductDto
      );

      if (!updatedProduct) {
        throw new NotFoundException(`Failed to update product with ID ${id}`);
      }

      this.logger.log(`Product updated: ${id}`);
      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `Error updating product ${id}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(id);

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const deleted = await this.productRepository.softDelete(id);

      if (!deleted) {
        throw new NotFoundException(`Failed to delete product with ID ${id}`);
      }

      this.logger.log(`Product deleted: ${id}`);
      return { id, deleted: true };
    } catch (error) {
      this.logger.error(
        `Error deleting product ${id}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
