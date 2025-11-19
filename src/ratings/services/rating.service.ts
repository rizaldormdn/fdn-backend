import { Injectable } from "@nestjs/common";
import { RatingRepository } from "../repositories/rating.repository";

@Injectable()
export class RatingsService {
  constructor(private readonly ratingRepository: RatingRepository) {}

  async createRating(data: {
    product_id: number;
    rate: number;
    count: number;
  }) {
    return this.ratingRepository.create(data);
  }

  async bulkCreateRatings(
    ratings: Array<{
      product_id: number;
      rate: number;
      count: number;
    }>
  ) {
    return this.ratingRepository.bulkCreate(ratings);
  }

  async findByProductId(productId: number) {
    return this.ratingRepository.findByProductId(productId);
  }

  async clearAll() {
    return this.ratingRepository.deleteAll();
  }
}
