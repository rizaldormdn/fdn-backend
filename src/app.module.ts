import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ProductsDatabaseModule } from "./databases/product-db/product-database.module";
import { RatingsDatabaseModule } from "./databases/rating-db/rating-database.module";
import { ProductModule } from "./products/product.module";
import { RatingsModule } from "./ratings/rating.module";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ProductsDatabaseModule,
    RatingsDatabaseModule,
    ProductModule,
    RatingsModule,
  ],
})
export class AppModule {}
