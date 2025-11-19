import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  MaxLength,
} from "class-validator";

export class CreateProductDto {
  @IsNotEmpty({ message: "Product ID is required" })
  @IsNumber({}, { message: "Product ID must be a number" })
  product_id: number;

  @IsNotEmpty({ message: "Product name is required" })
  @IsString({ message: "Product name must be a string" })
  @MaxLength(255, { message: "Product name must not exceed 255 characters" })
  name: string;

  @IsNotEmpty({ message: "Price is required" })
  @IsNumber({}, { message: "Price must be a number" })
  @Min(0, { message: "Price must be greater than or equal to 0" })
  price: number;
}
