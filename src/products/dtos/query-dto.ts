import { IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class QueryProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Page must be a number" })
  @Min(1, { message: "Page must be greater than or equal to 1" })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Limit must be a number" })
  @Min(1, { message: "Limit must be greater than or equal to 1" })
  limit?: number = 10;
}
