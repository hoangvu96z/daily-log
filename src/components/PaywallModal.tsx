import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme/palette';
import { styles } from '../styles';
import { useTranslation } from '../i18n/translations';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaywallModal({ visible, onClose, onSuccess }: PaywallModalProps) {
  const { t, lang } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'month' | 'year' | 'lifetime'>('lifetime');
  const [loading, setLoading] = useState(false);

  const setT = t.settings as any;

  const features = [
    {
      icon: 'sparkles-outline' as const,
      title: setT.paywallFeature1Title,
      desc: setT.paywallFeature1Desc,
    },
    {
      icon: 'images-outline' as const,
      title: setT.paywallFeature2Title,
      desc: setT.paywallFeature2Desc,
    },
    {
      icon: 'color-wand-outline' as const,
      title: setT.paywallFeature3Title,
      desc: setT.paywallFeature3Desc,
    },
    {
      icon: 'cloud-upload-outline' as const,
      title: setT.paywallFeature4Title,
      desc: setT.paywallFeature4Desc,
    },
  ];

  const handlePurchase = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        lang === 'vi' ? 'Nâng cấp thành công' : 'Upgrade Successful',
        lang === 'vi'
          ? 'Chào mừng bạn đến với Daily Log Premium! Các tính năng đã được mở khóa.'
          : 'Welcome to Daily Log Premium! All features have been unlocked.',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess();
              onClose();
            },
          },
        ]
      );
    }, 1800);
  };

  const handleRestore = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        lang === 'vi' ? 'Khôi phục thành công' : 'Restore Successful',
        lang === 'vi'
          ? 'Đã khôi phục giao dịch Premium của bạn.'
          : 'Your Premium purchase has been successfully restored.',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess();
              onClose();
            },
          },
        ]
      );
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={[styles.dialogCard, { width: '92%', maxHeight: '90%', paddingVertical: 22, paddingHorizontal: 20 }]}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="gift" size={22} color="#f59e0b" />
              <Text style={{ fontSize: 18, fontWeight: '800', color: palette.ink }}>{setT.paywallTitle}</Text>
            </View>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={palette.muted} />
            </Pressable>
          </View>

          <Text style={{ fontSize: 13, color: palette.muted, textAlign: 'center', marginBottom: 18 }}>
            {setT.paywallSubtitle}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, maxHeight: 380 }}>
            {/* Features list */}
            <View style={{ gap: 14, marginBottom: 20 }}>
              {features.map((feat, idx) => (
                <View key={idx} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: palette.primaryContainer,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 1
                  }}>
                    <Ionicons name={feat.icon} size={16} color={palette.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: palette.ink, marginBottom: 2 }}>
                      {feat.title}
                    </Text>
                    <Text style={{ fontSize: 11.5, color: palette.muted, lineHeight: 16 }}>
                      {feat.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Plans */}
            <View style={{ gap: 10, marginBottom: 16 }}>
              {/* Lifetime Plan */}
              <Pressable
                style={{
                  borderWidth: 2,
                  borderColor: selectedPlan === 'lifetime' ? palette.primary : '#e1e8e3',
                  borderRadius: 14,
                  padding: 12,
                  backgroundColor: selectedPlan === 'lifetime' ? palette.paper : '#f7faf8',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative'
                }}
                onPress={() => setSelectedPlan('lifetime')}
              >
                <View style={{
                  position: 'absolute',
                  top: -9,
                  right: 12,
                  backgroundColor: palette.coral,
                  paddingHorizontal: 8,
                  paddingVertical: 1,
                  borderRadius: 8
                }}>
                  <Text style={{ color: palette.white, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>
                    {setT.paywallBestValue}
                  </Text>
                </View>
                <View style={{ gap: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.ink }}>
                    {setT.paywallOptionLifetime}
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.muted }}>
                    {lang === 'vi' ? 'Thanh toán một lần' : 'One-time purchase'}
                  </Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: palette.primary }}>
                  {lang === 'vi' ? '199.000 đ' : '$9.99'}
                </Text>
              </Pressable>

              {/* Yearly Plan */}
              <Pressable
                style={{
                  borderWidth: 2,
                  borderColor: selectedPlan === 'year' ? palette.primary : '#e1e8e3',
                  borderRadius: 14,
                  padding: 12,
                  backgroundColor: selectedPlan === 'year' ? palette.paper : '#f7faf8',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onPress={() => setSelectedPlan('year')}
              >
                <View style={{ gap: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.ink }}>
                    {setT.paywallOptionYear}
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.muted }}>
                    {lang === 'vi' ? 'Tiết kiệm 55%' : 'Save 55%'}
                  </Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: palette.primary }}>
                  {lang === 'vi' ? '99.000 đ/năm' : '$4.99/yr'}
                </Text>
              </Pressable>

              {/* Monthly Plan */}
              <Pressable
                style={{
                  borderWidth: 2,
                  borderColor: selectedPlan === 'month' ? palette.primary : '#e1e8e3',
                  borderRadius: 14,
                  padding: 12,
                  backgroundColor: selectedPlan === 'month' ? palette.paper : '#f7faf8',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onPress={() => setSelectedPlan('month')}
              >
                <View style={{ gap: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.ink }}>
                    {setT.paywallOptionMonth}
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.muted }}>
                    {lang === 'vi' ? 'Hủy bất cứ lúc nào' : 'Cancel anytime'}
                  </Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: palette.primary }}>
                  {lang === 'vi' ? '19.000 đ/tháng' : '$0.99/mo'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Action button */}
          <View style={{ width: '100%', gap: 8, marginTop: 10 }}>
            <Pressable
              style={{
                backgroundColor: palette.primary,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                opacity: loading ? 0.8 : 1
              }}
              onPress={handlePurchase}
              disabled={loading}
            >
              {loading ? (
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

            <Pressable
              style={{ paddingVertical: 8, alignItems: 'center' }}
              onPress={handleRestore}
              disabled={loading}
            >
              <Text style={{ color: palette.muted, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' }}>
                {setT.paywallRestore}
              </Text>
            </Pressable>

            <Text style={{ fontSize: 10, color: palette.muted, textAlign: 'center', lineHeight: 14 }}>
              {setT.paywallFooter}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
