import React from 'react';
import { Modal, View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../AppText';
import { styles } from '../../styles';
import { palette } from '../../theme/palette';

export function PrivacyExplanationDialog({
  visible,
  onClose,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  t: any;
}) {
  const setT = t.settings as any;
  const sections = [
    {
      icon: 'phone-portrait-outline' as const,
      title: setT.privacyOnDeviceTitle,
      desc: setT.privacyOnDeviceDesc,
    },
    {
      icon: 'sparkles-outline' as const,
      title: setT.privacyAITitle,
      desc: setT.privacyAIDesc,
    },
    {
      icon: 'cloud-offline-outline' as const,
      title: setT.privacyServerTitle,
      desc: setT.privacyServerDesc,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={[styles.dialogCard, { width: '90%', paddingVertical: 24 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[styles.dialogTitle, { fontSize: 18, marginRight: 8, flex: 1 }]}>{setT.privacyTitle}</Text>
            <Pressable aria-label="close" onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={palette.muted} />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {sections.map((section, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 14, marginBottom: 20 }}>
                <View style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: palette.primaryContainer,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 2
                }}>
                  <Ionicons name={section.icon} size={18} color={palette.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: palette.ink, marginBottom: 4 }}>
                    {section.title}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: palette.muted, lineHeight: 18 }}>
                    {section.desc}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            style={[styles.saveButton, { marginTop: 12, width: '100%' }]}
            onPress={onClose}
          >
            <Text style={styles.saveButtonText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
