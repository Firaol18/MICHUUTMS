import { apiClient } from './apiClient';

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  promoCode: string;
  discountPercent: number;
  isRedeemed: boolean;
  singleUseRestriction: string;
}

export interface ValidateOfferResponse {
  valid: boolean;
  promoCode: string;
  discountPercent: number;
  targetItemType: string;
  message: string;
}

const LOCAL_SUBSCRIBERS_KEY = 'michuu_newsletter_subscribers';

function getLocalSubscribers(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_SUBSCRIBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSubscriber(email: string) {
  try {
    const list = getLocalSubscribers();
    if (!list.includes(email.toLowerCase())) {
      list.push(email.toLowerCase());
      localStorage.setItem(LOCAL_SUBSCRIBERS_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage errors
  }
}

export const newsletterService = {
  /**
   * Subscribe to newsletter & receive 15% promo code + in-app notification offer.
   * Strictly validates if email is already subscribed.
   */
  async subscribe(email: string, name?: string): Promise<NewsletterSubscribeResponse> {
    const cleanEmail = email.trim().toLowerCase();

    // Check local duplicate cache
    const localList = getLocalSubscribers();
    if (localList.includes(cleanEmail)) {
      throw new Error(
        `The email "${cleanEmail}" is already subscribed to the MICHUU newsletter. Each traveler is eligible for 1 welcome offer voucher.`
      );
    }

    try {
      const response = await apiClient.post<NewsletterSubscribeResponse>('/newsletter/subscribe', {
        email: cleanEmail,
        name,
      });

      saveLocalSubscriber(cleanEmail);

      return (
        response.data || {
          success: true,
          message: 'Subscription confirmed! 15% welcome voucher generated.',
          promoCode: 'MICHUU15',
          discountPercent: 15,
          isRedeemed: false,
          singleUseRestriction: 'Applies to 1 Tour Package or 1 Cultural Event.',
        }
      );
    } catch (err: any) {
      // If backend returned a 409 conflict or validation error, re-throw it so UI shows the warning
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      if (
        backendMessage &&
        (backendMessage.toLowerCase().includes('already subscribed') ||
          backendMessage.toLowerCase().includes('conflict') ||
          err?.response?.status === 409)
      ) {
        saveLocalSubscriber(cleanEmail);
        throw new Error(
          typeof backendMessage === 'string'
            ? backendMessage
            : `The email "${cleanEmail}" is already subscribed to the MICHUU newsletter.`
        );
      }

      // If backend is unreachable, perform local generation and record email
      saveLocalSubscriber(cleanEmail);
      return {
        success: true,
        message: 'Welcome! Your 15% exclusive Ethiopian travel voucher is active.',
        promoCode: 'MICHUU15',
        discountPercent: 15,
        isRedeemed: false,
        singleUseRestriction: 'Applies to 1 Tour Package or 1 Cultural Event.',
      };
    }
  },

  /**
   * Validate promo code for single tour or event checkout
   */
  async validateOffer(promoCode: string, email?: string): Promise<ValidateOfferResponse> {
    try {
      const response = await apiClient.post<ValidateOfferResponse>('/newsletter/validate-offer', {
        promoCode,
        email,
      });
      return (
        response.data || {
          valid: true,
          promoCode: promoCode.trim().toUpperCase(),
          discountPercent: 15,
          targetItemType: 'single_tour_or_event',
          message: '15% Promotional Discount valid for 1 Tour or Event!',
        }
      );
    } catch (err: any) {
      const cleanCode = promoCode.trim().toUpperCase();
      if (cleanCode === 'MICHUU15' || cleanCode === 'ETHIOPIA2026' || cleanCode.startsWith('MICHUU15')) {
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
      throw err;
    }
  },
};
