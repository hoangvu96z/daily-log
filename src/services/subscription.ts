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
  /**
   * TODO: Replace with RevenueCat SDK:
   *
   * import Purchases from 'react-native-purchases';
   * Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
   */

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    // Fallback to simulated plans until RevenueCat is integrated
    return new SimulatedPurchaseService().getAvailablePlans();
  }

  async purchase(planId: PlanId): Promise<PurchaseResult> {
    /**
     * RevenueCat:
     * const offerings = await Purchases.getOfferings();
     * const pkg = offerings.current?.availablePackages.find(p => p.identifier === planId);
     * const { customerInfo } = await Purchases.purchasePackage(pkg!);
     * const active = customerInfo.entitlements.active['premium'];
     * return { success: !!active, planId };
     */
    return new SimulatedPurchaseService().purchase(planId);
  }

  async restorePurchases(): Promise<PurchaseResult> {
    /**
     * RevenueCat:
     * const { customerInfo } = await Purchases.restorePurchases();
     * const active = customerInfo.entitlements.active['premium'];
     * return { success: !!active };
     */
    return new SimulatedPurchaseService().restorePurchases();
  }

  async checkEntitlement(): Promise<boolean> {
    /**
     * RevenueCat:
     * const { customerInfo } = await Purchases.getCustomerInfo();
     * return !!customerInfo.entitlements.active['premium'];
     */
    return new SimulatedPurchaseService().checkEntitlement();
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
