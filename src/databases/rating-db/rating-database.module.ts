import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: "ratingsConnection",
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("POSTGRES_RATINGS_HOST"),
        port: configService.get("POSTGRES_RATINGS_PORT"),
        username: configService.get("POSTGRES_RATINGS_USER"),
        password: configService.get("POSTGRES_RATINGS_PASSWORD"),
        database: configService.get("POSTGRES_RATINGS_DB"),
        entities: [],
        synchronize: false,
        logging: ["error", "warn"],
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class RatingsDatabaseModule {}
