import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Rating } from "../entities/rating.entity";

@Injectable()
export class RatingRepository {
  private readonly logger = new Logger(RatingRepository.name);
  constructor(
    @InjectDataSource("ratingsConnection")
    private dataSource: DataSource
  ) {}

  async findByProductId(productId: number): Promise<Rating | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM ratings WHERE product_id = $1 AND deleted_at IS NULL`,
      [productId]
    );
    return result[0] || null;
  }

  async create(data: {
    product_id: number;
    rate: number;
    count: number;
  }): Promise<Rating> {
    const result = await this.dataSource.query(
      `
      INSERT INTO ratings (
        product_id, 
        rate, 
        count, 
        created_at, 
        updated_at
      ) 
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING *`,
      [data.product_id, data.rate, data.count]
    );
    return result[0];
  }
  async bulkCreate(ratings: Partial<Rating>[]): Promise<Rating[]> {
    try {
      if (ratings.length === 0) return [];

      const values = ratings
        .map((_, i) => {
          const base = i * 3;
          return `($${base + 1}, $${base + 2}, $${base + 3})`;
        })
        .join(", ");

      const params = ratings.flatMap((r) => [r.product_id, r.rate, r.count]);

      const result = await this.dataSource.query(
        `
        INSERT INTO ratings (
            product_id,
            rate,
            count
        )
        VALUES ${values}
        ON CONFLICT (product_id) DO NOTHING
        RETURNING *`,
        params
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error bulk creating ratings: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException("Failed to bulk create ratings");
    }
  }

  async deleteAll(): Promise<number> {
    const result = await this.dataSource.query(
      `DELETE FROM ratings RETURNING id`
    );
    return result.length;
  }
}
