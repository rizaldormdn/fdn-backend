import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: "productsConnection",
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("POSTGRES_PRODUCTS_HOST"),
        port: configService.get("POSTGRES_PRODUCTS_PORT"),
        username: configService.get("POSTGRES_PRODUCTS_USER"),
        password: configService.get("POSTGRES_PRODUCTS_PASSWORD"),
        database: configService.get("POSTGRES_PRODUCTS_DB"),
        entities: [],
        synchronize: false,
        logging: ["error", "warn"],
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class ProductsDatabaseModule {}
