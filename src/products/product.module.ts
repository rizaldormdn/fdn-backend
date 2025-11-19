import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { RatingsModule } from "src/ratings/rating.module";
import { ProductsController } from "./controllers/product.controller";
import { ProductRepository } from "./repositories/product.repository";
import { ProductsService } from "./services/product.service";

@Module({
  imports: [HttpModule, RatingsModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
  exports: [ProductsService, ProductRepository],
})
export class ProductModule {}
