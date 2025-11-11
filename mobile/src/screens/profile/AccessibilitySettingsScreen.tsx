import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common';
import { Button } from '@/components/common/Button';
import { FontScale, useSettingsStore } from '@/store/settingsStore';
import { colors, spacing, SCALE_LABELS, useDynamicStyles } from '@/theme';
import { createStandardStyles } from '@/theme/dynamicStyles';

const FONT_SCALES: FontScale[] = ['small', 'medium', 'large', 'xlarge'];

export const AccessibilitySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const currentFontSize = useSettingsStore((state) => state.fontSize);
  const setFontSize = useSettingsStore((state) => state.setFontSize);
  const [selectedScale, setSelectedScale] = useState<FontScale>(currentFontSize);
  const dynamicStyles = useDynamicStyles();

  const handleApply = async (): Promise<void> => {
    await setFontSize(selectedScale);
    AccessibilityInfo.announceForAccessibility(
      `Tamanho da fonte alterado para ${SCALE_LABELS[selectedScale]}`
    );
    navigation.goBack();
  };

  const handleSelectScale = (scale: FontScale): void => {
    setSelectedScale(scale);
    AccessibilityInfo.announceForAccessibility(
      `Selecionado: ${SCALE_LABELS[scale]}`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={dynamicStyles.sectionTitle}>Tamanho da Fonte</Text>
          <Text style={dynamicStyles.secondaryText}>
            Escolha o tamanho que melhor se adequa à sua leitura
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {FONT_SCALES.map((scale) => {
            const isSelected = scale === selectedScale;
            const scaleStyles = createStandardStyles(scale);

            return (
              <TouchableOpacity
                key={scale}
                onPress={() => handleSelectScale(scale)}
                accessible={true}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${SCALE_LABELS[scale]}. ${isSelected ? 'Selecionado' : 'Não selecionado'}`}
                accessibilityHint="Toque duas vezes para selecionar este tamanho"
              >
                <Card
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                >
                  <View style={styles.optionHeader}>
                    <Text style={dynamicStyles.fieldValue}>
                      {SCALE_LABELS[scale]}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={28}
                        color={colors.primary[600]}
                      />
                    )}
                  </View>

                  <View style={styles.previewContainer}>
                    <Text
                      style={[
                        scaleStyles.fieldLabel,
                        { color: colors.text.secondary },
                      ]}
                    >
                      Título
                    </Text>
                    <Text
                      style={[
                        scaleStyles.fieldValue,
                        { color: colors.text.secondary, marginTop: spacing.xs },
                      ]}
                    >
                      Texto de exemplo
                    </Text>
                    <Text
                      style={[
                        scaleStyles.secondaryText,
                        { marginTop: spacing.xs },
                      ]}
                    >
                      Descrição secundária
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Aplicar"
            onPress={handleApply}
            variant="primary"
            fullWidth
            accessibilityLabel="Aplicar tamanho de fonte selecionado"
            accessibilityHint="Toque duas vezes para salvar e voltar"
          />
        </View>

        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary[600]}
          />
          <Text style={[dynamicStyles.secondaryText, styles.infoText]}>
            Esta configuração afetará todos os textos do aplicativo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  optionCard: {
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  optionCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewContainer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
  },
});
