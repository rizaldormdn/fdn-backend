import { Module } from "@nestjs/common";
import { RatingRepository } from "./repositories/rating.repository";
import { RatingsService } from "./services/rating.service";

@Module({
  providers: [RatingsService, RatingRepository],
  exports: [RatingsService, RatingRepository],
})
export class RatingsModule {}
