import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Product } from "../entities/product.entity";

@Injectable()
export class ProductRepository {
  private readonly logger = new Logger(ProductRepository.name);

  constructor(
    @InjectDataSource("productsConnection")
    private dataSource: DataSource
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Product[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const data = await this.dataSource.query(
        `
        SELECT
            id,
            product_id AS "productId",
            name,
            price,
            created_at AS "createdAt",
            updated_at AS "updatedAt",
            deleted_at AS "deletedAt"
        FROM 
            products 
         WHERE 
            deleted_at IS NULL 
         ORDER BY 
            created_at DESC 
         LIMIT $1 
         OFFSET $2`,
        [limit, offset]
      );

      const [{ count }] = await this.dataSource.query(
        `SELECT COUNT(id) as count FROM products WHERE deleted_at IS NULL`
      );

      return {
        data,
        total: parseInt(count),
      };
    } catch (error) {
      this.logger.error(
        `Error finding all products: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Failed to fetch products");
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const result = await this.dataSource.query(
        `
        SELECT
            id,
            product_id AS "productId",
            name,
            price,
            created_at AS "createdAt",
            updated_at AS "updatedAt",
            deleted_at AS "deletedAt"
        FROM 
            products 
        WHERE 
            id = $1 
        AND 
            deleted_at IS NULL`,
        [id]
      );
      return result[0] || null;
    } catch (error) {
      this.logger.error(
        `Error finding product by id ${id}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Failed to fetch product");
    }
  }

  async findByProductId(productId: number): Promise<Product | null> {
    try {
      const result = await this.dataSource.query(
        `
        SELECT 
            id,
            product_id AS "productId",
            name,
            price,
            created_at AS "createdAt",
            updated_at AS "updatedAt",
            deleted_at AS "deletedAt" 
        FROM 
            products 
        WHERE 
            product_id = $1 
        AND 
            deleted_at IS NULL`,
        [productId]
      );
      return result[0] || null;
    } catch (error) {
      this.logger.error(
        `Error finding product by product_id ${productId}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Failed to fetch product");
    }
  }

  async findByName(name: string): Promise<Product | null> {
    try {
      const result = await this.dataSource.query(
        `
        SELECT 
            id,
            product_id AS "productId",
            name,
            price,
            created_at AS "createdAt",
            updated_at AS "updatedAt",
            deleted_at AS "deletedAt"
        FROM 
            products 
        WHERE 
            name = $1 
        AND 
            deleted_at IS NULL`,
        [name]
      );
      return result[0] || null;
    } catch (error) {
      this.logger.error(
        `Error finding product by name ${name}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Failed to fetch product");
    }
  }

  async create(data: Partial<Product>): Promise<Product> {
    try {
      const result = await this.dataSource.query(
        `
        INSERT INTO products (
            product_id, 
            name, 
            price
        ) 
        VALUES ($1, $2, $3) 
        RETURNING *`,
        [data.product_id, data.name, data.price]
      );
      return result[0];
    } catch (error) {
      this.logger.error(
        `Error creating product: ${error.message}`,
        error.stack
      );
      if (error.code === "23505") {
        throw new InternalServerErrorException(
          "Product with this name or product_id already exists"
        );
      }
      throw new InternalServerErrorException("Failed to create product");
    }
  }

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(data.name);
      }
      if (data.price !== undefined) {
        fields.push(`price = $${paramIndex++}`);
        values.push(data.price);
      }
      if (data.product_id !== undefined) {
        fields.push(`product_id = $${paramIndex++}`);
        values.push(data.product_id);
      }

      if (fields.length === 0) return null;

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await this.dataSource.query(
        `UPDATE products 
       SET ${fields.join(", ")} 
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
        values
      );
      return result[0] || null;
    } catch (error) {
      this.logger.error(
        `Error updating product ${id}: ${error.message}`,
        error.stack
      );
      if (error.code === "23505") {
        throw new InternalServerErrorException(
          "Product with this name or product_id already exists"
        );
      }
      throw new InternalServerErrorException("Failed to update product");
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `UPDATE 
            products 
         SET 
            deleted_at = CURRENT_TIMESTAMP 
         WHERE 
            id = $1 
        AND 
            deleted_at IS NULL 
        RETURNING id`,
        [id]
      );
      return result.length > 0;
    } catch (error) {
      this.logger.error(
        `Error deleting product ${id}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Failed to delete product");
    }
  }

  async bulkCreate(products: Partial<Product>[]): Promise<Product[]> {
    try {
      if (products.length === 0) return [];

      // Generate VALUES ($1, $2, $3), ($4, $5, $6)
      const values = products
        .map((_, i) => {
          const base = i * 3;
          return `($${base + 1}, $${base + 2}, $${base + 3})`;
        })
        .join(", ");

      const params = products.flatMap((p) => [p.product_id, p.name, p.price]);

      const result = await this.dataSource.query(
        `
        INSERT INTO products (
            product_id, 
            name, 
            price
        ) 
        VALUES ${values} 
        ON CONFLICT (product_id) DO NOTHING 
        RETURNING *`,
        params
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error bulk creating products: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Failed to bulk create products");
    }
  }

  async deleteAll(): Promise<number> {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM products RETURNING id`
      );
      return result.length;
    } catch (error) {
      this.logger.error(
        `Error deleting all products: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Failed to delete all products");
    }
  }
}
