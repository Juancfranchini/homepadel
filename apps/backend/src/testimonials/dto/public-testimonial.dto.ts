import { IsInt, IsString, MaxLength, Min, MinLength, Max } from 'class-validator';

export class PublicTestimonialDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  comment: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
