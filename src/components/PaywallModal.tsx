/**
 * PaywallModal — Premium upgrade / restore screen.
 *
 * Wired to SubscriptionService so purchase & restore calls go through
 * the real (or simulated) IAP backend.
 * Drop RevenueCat into subscription.ts → this component needs no changes.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  View } from 'react-native';
import { Text } from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme/palette';
import { styles } from '../styles';
import { useTranslation } from '../i18n/translations';
import {
  DEFAULT_PLANS,
  PlanId,
  SubscriptionPlan,
  SubscriptionService,
} from '../services/subscription';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Feature list ──────────────────────────────────────────────────────────────

const FEATURES: Array<{ icon: 'sparkles-outline' | 'images-outline' | 'color-wand-outline' | 'cloud-upload-outline' | 'calendar-outline'; titleKey: string; descKey: string }> = [
  { icon: 'sparkles-outline',    titleKey: 'paywallFeature1Title', descKey: 'paywallFeature1Desc' },
  { icon: 'images-outline',      titleKey: 'paywallFeature2Title', descKey: 'paywallFeature2Desc' },
  { icon: 'color-wand-outline',  titleKey: 'paywallFeature3Title', descKey: 'paywallFeature3Desc' },
  { icon: 'cloud-upload-outline',titleKey: 'paywallFeature4Title', descKey: 'paywallFeature4Desc' },
  { icon: 'calendar-outline',    titleKey: 'paywallFeature5Title', descKey: 'paywallFeature5Desc' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PaywallModal({ visible, onClose, onSuccess }: PaywallModalProps) {
  const { t, lang } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('lifetime');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'purchase' | 'restore' | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);

  const setT = t.settings as any;

  // Fetch live plan prices when modal opens
  useEffect(() => {
    if (!visible) return;
    SubscriptionService.shared()
      .getAvailablePlans()
      .then(setPlans)
      .catch(() => setPlans(DEFAULT_PLANS));
  }, [visible]);

  const handlePurchase = useCallback(async () => {
    setLoading(true);
    setLoadingAction('purchase');
    try {
      const result = await SubscriptionService.shared().purchase(selectedPlan);
      if (result.success) {
        Alert.alert(
          setT.paywallUpgradeSuccessTitle,
          setT.paywallUpgradeSuccessDesc,
          [{ text: 'OK', onPress: () => { onSuccess(); onClose(); } }],
        );
      } else if (!result.cancelled) {
        Alert.alert(
          setT.paywallPaymentError,
          result.error ?? setT.paywallPaymentErrorDesc,
          [{ text: 'OK' }],
        );
      }
    } catch (err: any) {
      Alert.alert(setT.paywallPaymentError, err?.message ?? 'Unknown error', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  }, [selectedPlan, setT, onSuccess, onClose]);

  const handleRestore = useCallback(async () => {
    setLoading(true);
    setLoadingAction('restore');
    try {
      const result = await SubscriptionService.shared().restorePurchases();
      if (result.success) {
        Alert.alert(
          setT.paywallRestoreSuccessTitle,
          setT.paywallRestoreSuccessDesc,
          [{ text: 'OK', onPress: () => { onSuccess(); onClose(); } }],
        );
      } else {
        Alert.alert(
          setT.paywallNoPurchase,
          result.error ?? setT.paywallNoPurchaseDesc,
          [{ text: 'OK' }],
        );
      }
    } catch (err: any) {
      Alert.alert(setT.paywallPaymentError, err?.message ?? 'Unknown error', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  }, [setT, onSuccess, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={[
          styles.dialogCard,
          { width: '92%', maxHeight: '92%', paddingVertical: 22, paddingHorizontal: 20 },
        ]}>
          {/* ── Header ─────────────────────────────────────── */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="gift" size={22} color="#f59e0b" />
              <Text style={{ fontSize: 18, fontWeight: '800', color: palette.ink }}>
                {setT.paywallTitle}
              </Text>
            </View>
            <Pressable aria-label="close" testID="paywall-close" onPress={onClose} style={{ padding: 4 }} hitSlop={8}>
              <Ionicons name="close" size={24} color={palette.muted} />
            </Pressable>
          </View>

          <Text style={{ fontSize: 13, color: palette.muted, textAlign: 'center', marginBottom: 16 }}>
            {setT.paywallSubtitle}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* ── Features ───────────────────────────────── */}
            <View style={{ gap: 12, marginBottom: 20 }}>
              {FEATURES.map((feat, idx) => {
                const title = setT[feat.titleKey] ?? '';
                const desc  = setT[feat.descKey]  ?? '';
                if (!title) return null;
                return (
                  <View key={idx} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                    <View style={{
                      width: 32, height: 32, borderRadius: 16,
                      backgroundColor: palette.primaryContainer,
                      justifyContent: 'center', alignItems: 'center', marginTop: 1,
                    }}>
                      <Ionicons name={feat.icon} size={16} color={palette.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: palette.ink, marginBottom: 2 }}>
                        {title}
                      </Text>
                      <Text style={{ fontSize: 11.5, color: palette.muted, lineHeight: 16 }}>
                        {desc}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* ── Plan cards ─────────────────────────────── */}
            <View style={{ gap: 10, marginBottom: 16 }}>
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <Pressable
                    key={plan.id}
                    style={{
                      borderWidth: 2,
                      borderColor: isSelected ? palette.primary : '#e1e8e3',
                      borderRadius: 14,
                      padding: 13,
                      backgroundColor: isSelected ? palette.primaryContainer : '#f7faf8',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    {/* Best-value badge */}
                    {plan.isHighlighted && (
                      <View style={{
                        position: 'absolute', top: -9, right: 12,
                        backgroundColor: palette.coral,
                        paddingHorizontal: 8, paddingVertical: 1, borderRadius: 8,
                      }}>
                        <Text style={{ color: palette.white, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>
                          {setT.paywallBestValue ?? 'Best Value'}
                        </Text>
                      </View>
                    )}
                    <View style={{ gap: 2 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: palette.ink }}>
                        {plan.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: palette.muted }}>
                        {plan.description}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: palette.primary }}>
                        {plan.priceString}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color={palette.primary} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* ── Actions ──────────────────────────────────── */}
          <View style={{ width: '100%', gap: 8, marginTop: 10 }}>
            {/* Primary CTA */}
            <Pressable
              style={{
                backgroundColor: palette.primary,
                borderRadius: 14, paddingVertical: 14,
                alignItems: 'center', flexDirection: 'row',
                justifyContent: 'center', gap: 8,
                opacity: loading ? 0.75 : 1,
              }}
              onPress={handlePurchase}
              disabled={loading}
            >
              {loadingAction === 'purchase' ? (
                <ActivityIndicator size="small" color={palette.white} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={16} color={palette.white} />
                  <Text style={{ color: palette.white, fontSize: 14, fontWeight: '700' }}>
                    {setT.paywallButton}
                  </Text>
                </>
              )}
            </Pressable>

            {/* Restore */}
            <Pressable
              style={{ paddingVertical: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}
              onPress={handleRestore}
              disabled={loading}
            >
              {loadingAction === 'restore' && <ActivityIndicator size="small" color={palette.muted} />}
              <Text style={{ color: palette.muted, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' }}>
                {setT.paywallRestore}
              </Text>
            </Pressable>

            {/* Legal footer */}
            <Text style={{ fontSize: 10, color: palette.muted, textAlign: 'center', lineHeight: 14 }}>
              {setT.paywallFooter}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
