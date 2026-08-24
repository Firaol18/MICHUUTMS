import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubscribeNewsletterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class ValidateOfferDto {
  @IsString()
  @IsNotEmpty({ message: 'Promo code is required' })
  promoCode: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  itemType?: 'tour' | 'event' | 'hotel' | 'transport';
}

export class RedeemOfferDto {
  @IsString()
  @IsNotEmpty({ message: 'Promo code is required' })
  promoCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Booking reference is required' })
  bookingRef: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
