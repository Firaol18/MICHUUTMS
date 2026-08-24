import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto, ValidateOfferDto, RedeemOfferDto } from './dto/newsletter.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Post('validate-offer')
  @HttpCode(HttpStatus.OK)
  async validateOffer(@Body() dto: ValidateOfferDto) {
    return this.newsletterService.validateOffer(dto);
  }

  @Post('redeem-offer')
  @HttpCode(HttpStatus.OK)
  async redeemOffer(@Body() dto: RedeemOfferDto) {
    return this.newsletterService.redeemOffer(dto);
  }

  @Get('subscribers')
  async findAll() {
    return this.newsletterService.findAll();
  }
}
