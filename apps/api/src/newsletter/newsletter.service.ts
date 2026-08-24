import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription } from './entities/newsletter.entity';
import { SubscribeNewsletterDto, ValidateOfferDto, RedeemOfferDto } from './dto/newsletter.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly repo: Repository<NewsletterSubscription>,
    private readonly notifService: NotificationsService,
  ) {}

  /**
   * Subscribe an email address to the newsletter, generate a 15% promo code,
   * and emit an in-app notification offer to the traveler.
   */
  async subscribe(dto: SubscribeNewsletterDto) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const existingSubscription = await this.repo.findOne({ where: { email: cleanEmail } });

    if (existingSubscription) {
      throw new ConflictException(
        `The email address "${cleanEmail}" is already subscribed to the MICHUU newsletter. Each traveler is eligible for 1 welcome offer voucher.`
      );
    }

    // Generate clean personalized promo code e.g. MICHUU15-7K2P
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const promoCode = `MICHUU15-${suffix}`;

    const subscription = this.repo.create({
      email: cleanEmail,
      name: dto.name?.trim(),
      promoCode,
      discountPercent: 15,
      isRedeemed: false,
    });

    await this.repo.save(subscription);

    // Trigger In-App Notification offer
    try {
      await this.notifService.create({
        title: '🎉 15% Welcome Travel Voucher Active!',
        message: `Your exclusive promo code ${promoCode} is ready. Enjoy 15% off any 1 Tour Package or Cultural Event of your choice.`,
        type: 'promotion' as any,
        targetRole: 'customer',
        userEmail: cleanEmail,
        link: '/tours',
      });
    } catch {
      // Non-blocking if notification creation fails
    }

    return {
      success: true,
      message: 'Subscription confirmed! 15% welcome voucher generated.',
      promoCode: subscription.promoCode,
      discountPercent: subscription.discountPercent,
      isRedeemed: false,
      singleUseRestriction: 'Applies to 1 Tour Package or 1 Cultural Event.',
    };
  }

  /**
   * Validate promo code for single tour/event application
   */
  async validateOffer(dto: ValidateOfferDto) {
    const cleanCode = dto.promoCode.trim().toUpperCase();

    // Standard platform welcome codes
    if (cleanCode === 'MICHUU15' || cleanCode === 'ETHIOPIA2026') {
      return {
        valid: true,
        promoCode: cleanCode,
        discountPercent: 15,
        targetItemType: 'single_tour_or_event',
        message: '15% Promotional Discount valid for 1 Tour or Event!',
      };
    }

    if (cleanCode === 'WELCOME10') {
      return {
        valid: true,
        promoCode: cleanCode,
        discountPercent: 10,
        targetItemType: 'single_tour_or_event',
        message: '10% Welcome Discount valid for 1 Tour or Event!',
      };
    }

    // Check database for personalized newsletter codes
    const sub = await this.repo.findOne({ where: { promoCode: cleanCode } });

    if (!sub) {
      throw new BadRequestException('Invalid promotional offer code.');
    }

    if (sub.isRedeemed) {
      throw new ConflictException(
        `This offer code (${cleanCode}) has already been redeemed on booking ${sub.redeemedBookingRef || ''}.`,
      );
    }

    if (dto.email && sub.email.toLowerCase() !== dto.email.trim().toLowerCase()) {
      // Optional check if bound to specific email
      // Allow flexible application with matching notice
    }

    return {
      valid: true,
      promoCode: sub.promoCode,
      discountPercent: sub.discountPercent,
      targetItemType: 'single_tour_or_event',
      message: `Verified! ${sub.discountPercent}% Discount applied to 1 Tour Package or Event.`,
    };
  }

  /**
   * Redeem promo code upon checkout/booking creation
   */
  async redeemOffer(dto: RedeemOfferDto) {
    const cleanCode = dto.promoCode.trim().toUpperCase();
    const sub = await this.repo.findOne({ where: { promoCode: cleanCode } });

    if (sub && !sub.isRedeemed) {
      sub.isRedeemed = true;
      sub.redeemedBookingRef = dto.bookingRef;
      sub.redeemedAt = new Date();
      await this.repo.save(sub);
    }

    return { success: true, message: `Promo code ${cleanCode} marked as redeemed.` };
  }

  /**
   * Admin: List all subscribers
   */
  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
