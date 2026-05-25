/**
 * subscription.ts — IAP / Subscription Service Layer
 *
 * Architecture:
 * - Native (iOS / Android): wraps expo-in-app-purchases (Expo SDK 51 compatible)
 * - Web / simulator: uses a SimulatedPurchaseService for development / testing
 *
 * Plans:
 *  - monthly  : 19,000 VND / month  (~$0.99)
 *  - yearly   : 99,000 VND / year   (~$4.99)  — save 55%
 *  - lifetime : 199,000 VND once    (~$9.99)  — best value
 *
 * Usage:
 *  const svc = await SubscriptionService.shared();
 *  const plans = await svc.getAvailablePlans();
 *  const result = await svc.purchase('yearly');
 *  const restored = await svc.restorePurchases();
 *
 * Note on RevenueCat integration:
 *  When you add RevenueCat, replace the `NativePurchaseService` class body
 *  with RevenueCat SDK calls (`Purchases.configure`, `Purchases.getOfferings`,
 *  `Purchases.purchasePackage`, `Purchases.restorePurchases`).
 *  The rest of the codebase (PaywallModal, MeScreen) stays unchanged because
 *  they only depend on the interface below.
 */

import { Platform } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

// IMPORTANT: Replace these with your actual RevenueCat Public API Keys later
const REVENUECAT_API_KEY_IOS = 'appl_YOUR_IOS_KEY_HERE';
const REVENUECAT_API_KEY_ANDROID = 'goog_YOUR_ANDROID_KEY_HERE';
const ENTITLEMENT_ID = 'premium';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlanId = 'monthly' | 'yearly' | 'lifetime';

export interface SubscriptionPlan {
  id: PlanId;
  /** Localised display title */
  title: string;
  /** Short descriptor e.g. "Save 55%" */
  description: string;
  /** Formatted price string e.g. "19.000 đ/tháng" */
  priceString: string;
  /** Raw price in smallest currency unit (VND) */
  priceVND: number;
  /** Whether this plan is the recommended one */
  isHighlighted: boolean;
}

export interface PurchaseResult {
  success: boolean;
  planId?: PlanId;
  /** ISO timestamp of purchase */
  purchasedAt?: string;
  error?: string;
  /** true if user cancelled without error */
  cancelled?: boolean;
}

export interface ISubscriptionService {
  /** Fetch available plans (prices may come from store on native) */
  getAvailablePlans(): Promise<SubscriptionPlan[]>;
  /** Initiate purchase flow for a plan */
  purchase(planId: PlanId): Promise<PurchaseResult>;
  /** Restore existing purchases (required by App Store guidelines) */
  restorePurchases(): Promise<PurchaseResult>;
  /** Check if user currently has an active entitlement */
  checkEntitlement(): Promise<boolean>;
}

// ─── Simulated service (web + simulator) ──────────────────────────────────────

class SimulatedPurchaseService implements ISubscriptionService {
  private static readonly STORAGE_KEY = 'dl_premium_entitlement';

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    return [
      {
        id: 'lifetime',
        title: 'Trọn Đời',
        description: 'Thanh toán một lần',
        priceString: '199.000 đ',
        priceVND: 199_000,
        isHighlighted: true,
      },
      {
        id: 'yearly',
        title: 'Gói Năm',
        description: 'Tiết kiệm 55%',
        priceString: '99.000 đ / năm',
        priceVND: 99_000,
        isHighlighted: false,
      },
      {
        id: 'monthly',
        title: 'Gói Tháng',
        description: 'Hủy bất cứ lúc nào',
        priceString: '19.000 đ / tháng',
        priceVND: 19_000,
        isHighlighted: false,
      },
    ];
  }

  async purchase(planId: PlanId): Promise<PurchaseResult> {
    // Simulate network latency
    await delay(1500);
    // Simulate 5% failure rate in development
    if (Math.random() < 0.05) {
      return { success: false, error: 'Simulated payment gateway error' };
    }
    // Persist entitlement locally (production would use server receipt validation)
    this._setEntitlement(true, planId);
    return {
      success: true,
      planId,
      purchasedAt: new Date().toISOString(),
    };
  }

  async restorePurchases(): Promise<PurchaseResult> {
    await delay(1200);
    const has = await this.checkEntitlement();
    if (has) {
      return { success: true, purchasedAt: new Date().toISOString() };
    }
    return {
      success: false,
      cancelled: false,
      error: 'Không tìm thấy giao dịch nào để khôi phục.',
    };
  }

  async checkEntitlement(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(SimulatedPurchaseService.STORAGE_KEY) === 'true';
      }
      // On native simulator, always return false unless overridden
      return false;
    } catch {
      return false;
    }
  }

  private _setEntitlement(value: boolean, _planId?: PlanId) {
    try {
      if (Platform.OS === 'web') {
        if (value) {
          localStorage.setItem(SimulatedPurchaseService.STORAGE_KEY, 'true');
        } else {
          localStorage.removeItem(SimulatedPurchaseService.STORAGE_KEY);
        }
      }
    } catch {
      // ignore
    }
  }
}

// ─── Native service placeholder (RevenueCat / expo-iap) ───────────────────────

class NativePurchaseService implements ISubscriptionService {
  private isConfigured = false;

  private async ensureConfigured() {
    if (this.isConfigured) return;
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
    }
    this.isConfigured = true;
  }

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    try {
      await this.ensureConfigured();
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        return offerings.current.availablePackages.map((pkg: PurchasesPackage) => {
          let planId: PlanId = 'monthly';
          if (pkg.identifier.includes('year') || pkg.identifier.includes('annual')) planId = 'yearly';
          if (pkg.identifier.includes('lifetime') || pkg.identifier.includes('forever')) planId = 'lifetime';
          
          return {
            id: planId,
            title: pkg.product.title,
            description: pkg.product.description,
            priceString: pkg.product.priceString,
            priceVND: pkg.product.price,
            isHighlighted: planId === 'lifetime',
          };
        });
      }
    } catch (e) {
      console.warn("RevenueCat getOfferings error:", e);
    }
    // Fallback to simulated if fetch fails or no packages configured yet
    return new SimulatedPurchaseService().getAvailablePlans();
  }

  async purchase(planId: PlanId): Promise<PurchaseResult> {
    try {
      await this.ensureConfigured();
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(p => p.identifier.toLowerCase().includes(planId));
      
      if (!pkg) {
        return { success: false, error: 'Package not found on RevenueCat' };
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      
      return { success: isActive, planId, purchasedAt: new Date().toISOString() };
    } catch (e: any) {
      if (e.userCancelled) {
        return { success: false, cancelled: true };
      }
      return { success: false, error: e.message };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    try {
      await this.ensureConfigured();
      const customerInfo = await Purchases.restorePurchases();
      const isActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      
      if (isActive) {
        return { success: true, purchasedAt: new Date().toISOString() };
      }
      return { success: false, error: 'Không tìm thấy giao dịch nào để khôi phục.' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async checkEntitlement(): Promise<boolean> {
    try {
      await this.ensureConfigured();
      const customerInfo = await Purchases.getCustomerInfo();
      return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    } catch (e) {
      return false;
    }
  }
}

// ─── Singleton factory ─────────────────────────────────────────────────────────

let _instance: ISubscriptionService | null = null;

export const SubscriptionService = {
  /**
   * Get (or create) the singleton subscription service instance.
   * Uses NativePurchaseService on iOS/Android, SimulatedPurchaseService on web.
   */
  shared(): ISubscriptionService {
    if (!_instance) {
      _instance = Platform.OS === 'web'
        ? new SimulatedPurchaseService()
        : new NativePurchaseService();
    }
    return _instance;
  },

  /**
   * Override the singleton — useful for testing.
   */
  setShared(service: ISubscriptionService) {
    _instance = service;
  },

  /**
   * Reset singleton (call in tests teardown).
   */
  reset() {
    _instance = null;
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Convenience: get all plans synchronously (from last fetch or defaults) */
export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'lifetime',
    title: 'Trọn Đời',
    description: 'Thanh toán một lần',
    priceString: '199.000 đ',
    priceVND: 199_000,
    isHighlighted: true,
  },
  {
    id: 'yearly',
    title: 'Gói Năm',
    description: 'Tiết kiệm 55%',
    priceString: '99.000 đ / năm',
    priceVND: 99_000,
    isHighlighted: false,
  },
  {
    id: 'monthly',
    title: 'Gói Tháng',
    description: 'Hủy bất cứ lúc nào',
    priceString: '19.000 đ / tháng',
    priceVND: 19_000,
    isHighlighted: false,
  },
];
