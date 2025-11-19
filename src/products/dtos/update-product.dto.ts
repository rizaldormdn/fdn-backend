import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  MaxLength,
} from "class-validator";

export class UpdateProductDto {
  @IsOptional()
  @IsNumber({}, { message: "Product ID must be a number" })
  product_id?: number;

  @IsOptional()
  @IsString({ message: "Product name must be a string" })
  @MaxLength(255, { message: "Product name must not exceed 255 characters" })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: "Price must be a number" })
  @Min(0, { message: "Price must be greater than or equal to 0" })
  price?: number;
}
