import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../i18n/translations';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { ComposerMode } from '../types';

export function AddMomentSheet({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (mode: ComposerMode) => void;
}) {
  const { t } = useTranslation();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={['55%']}
      index={0}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
      )}
      handleIndicatorStyle={{ backgroundColor: '#ccd3ce', width: 46 }}
      backgroundStyle={{ backgroundColor: palette.paper, borderRadius: 24 }}
    >
      <View style={{ padding: 22 }}>
        <Text style={styles.sheetTitle}>{t.addMoment.title}</Text>
        <SheetAction
          icon="camera-outline"
          title={t.addMoment.captureTitle}
          subtitle={t.addMoment.captureSubtitle}
          onPress={() => onPick('photo')}
        />
        <SheetAction
          icon="create-outline"
          title={t.addMoment.noteTitle}
          subtitle={t.addMoment.noteSubtitle}
          onPress={() => onPick('note')}
        />
        <SheetAction
          icon="calendar-clear-outline"
          title={t.addMoment.calendarTitle}
          subtitle={t.addMoment.calendarSubtitle}
          onPress={() => onPick('calendar')}
        />
      </View>
    </BottomSheetModal>
  );
}

function SheetAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.sheetAction} onPress={onPress}>
      <View style={styles.sheetIcon}>
        <Ionicons name={icon} size={24} color={palette.green} />
      </View>
      <View style={styles.sheetActionText}>
        <Text style={styles.sheetActionTitle}>{title}</Text>
        <Text style={styles.sheetActionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#a9b0ab" />
    </Pressable>
  );
}
