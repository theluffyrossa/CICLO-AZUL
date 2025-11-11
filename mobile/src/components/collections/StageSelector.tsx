import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageStage } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface StageSelectorProps {
  value: ImageStage;
  onChange: (stage: ImageStage) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

interface StageOption {
  value: ImageStage;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const STAGE_OPTIONS: StageOption[] = [
  {
    value: ImageStage.COLLECTION,
    label: 'Coleta',
    icon: 'car-outline',
    description: 'Foto tirada durante a coleta',
  },
  {
    value: ImageStage.RECEPTION,
    label: 'Recepção',
    icon: 'log-in-outline',
    description: 'Foto tirada na recepção do material',
  },
  {
    value: ImageStage.SORTING,
    label: 'Triagem',
    icon: 'file-tray-full-outline',
    description: 'Foto tirada durante a triagem',
  },
];

export const StageSelector: React.FC<StageSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  accessibilityLabel = 'Etapa da foto',
}) => {
  const handleStageChange = (stage: ImageStage): void => {
    if (disabled) return;

    onChange(stage);

    const selected = STAGE_OPTIONS.find((opt) => opt.value === stage);
    if (selected) {
      AccessibilityInfo.announceForAccessibility(
        `Etapa selecionada: ${selected.label}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label} accessibilityRole="text">
        {accessibilityLabel}
      </Text>

      <View style={styles.options}>
        {STAGE_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => handleStageChange(option.value)}
              disabled={disabled}
              accessible={true}
              accessibilityRole="radio"
              accessibilityState={{
                disabled,
                checked: isSelected,
              }}
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
            >
              <Ionicons
                name={option.icon}
                size={24}
                color={isSelected ? colors.primary[600] : colors.neutral[600]}
              />
              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>

              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary[600]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.base,
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  optionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.primary[600],
  },
  optionDescription: {
    ...typography.caption,
    color: colors.neutral[600],
  },
});
