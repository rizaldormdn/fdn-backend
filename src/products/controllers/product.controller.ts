import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  Logger,
} from "@nestjs/common";
import { ResponseDto } from "src/commons/dtos/response.dto";
import { ProductsService } from "../services/product.service";
import { CreateProductDto } from "../dtos/create-product.dto";
import { UpdateProductDto } from "../dtos/update-product.dto";
import { AuthGuard } from "src/commons/guards/auth.guard";
import { QueryProductDto } from "../dtos/query-dto";

@Controller("product")
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get("fetch")
  @HttpCode(HttpStatus.OK)
  async fetchProducts() {
    try {
      this.logger.log("Fetch products endpoint called");

      const result = await this.productsService.fetchAndStoreProducts();

      return ResponseDto.success(
        "Products fetched and stored successfully",
        result.products,
        {
          summary: result.summary,
        }
      );
    } catch (error) {
      this.logger.error(
        `Error in fetchProducts: ${error.message}`,
        error.stack
      );
      return ResponseDto.error(error.message || "Failed to fetch products");
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    queryDto: QueryProductDto
  ) {
    try {
      this.logger.log(
        `Get all products - page: ${queryDto.page}, limit: ${queryDto.limit}`
      );

      const result = await this.productsService.findAll(
        queryDto.page,
        queryDto.limit
      );

      return ResponseDto.success(
        "Products retrieved successfully",
        result.data,
        result.meta
      );
    } catch (error) {
      this.logger.error(`Error in findAll: ${error.message}`, error.stack);
      return ResponseDto.error(error.message || "Failed to retrieve products");
    }
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOne(@Param("id") id: string) {
    try {
      this.logger.log(`Get product by id: ${id}`);

      const product = await this.productsService.findOne(id);

      return ResponseDto.success("Product retrieved successfully", product);
    } catch (error) {
      this.logger.error(`Error in findOne: ${error.message}`, error.stack);
      return ResponseDto.error(error.message || "Failed to retrieve product");
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createProductDto: CreateProductDto) {
    try {
      this.logger.log(`Create product: ${createProductDto.name}`);

      const product = await this.productsService.create(createProductDto);

      return ResponseDto.success("Product created successfully", product);
    } catch (error) {
      this.logger.error(`Error in create: ${error.message}`, error.stack);
      return ResponseDto.error(error.message || "Failed to create product");
    }
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  async update(
    @Param("id") id: string,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto
  ) {
    try {
      this.logger.log(`Update product: ${id}`);

      const product = await this.productsService.update(id, updateProductDto);

      return ResponseDto.success("Product updated successfully", product);
    } catch (error) {
      this.logger.error(`Error in update: ${error.message}`, error.stack);
      return ResponseDto.error(error.message || "Failed to update product");
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string) {
    try {
      this.logger.log(`Delete product: ${id}`);

      const result = await this.productsService.remove(id);

      return ResponseDto.success("Product deleted successfully", result);
    } catch (error) {
      this.logger.error(`Error in remove: ${error.message}`, error.stack);
      return ResponseDto.error(error.message || "Failed to delete product");
    }
  }
}
