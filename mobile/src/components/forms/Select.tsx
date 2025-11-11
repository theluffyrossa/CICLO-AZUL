import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  AccessibilityProps,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, standardStyles } from '@/theme';

export interface SelectOption {
  label: string;
  value: string | number;
  emoji?: string;
}

interface SelectProps extends AccessibilityProps {
  label: string;
  placeholder?: string;
  value: string | number | null;
  options: SelectOption[];
  onValueChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  emoji?: string;
  centerLabel?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Selecione...',
  value,
  options,
  onValueChange,
  error,
  disabled = false,
  required = false,
  emoji,
  centerLabel = false,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (selectedValue: string | number): void => {
    onValueChange(selectedValue);
    setModalVisible(false);

    const selectedLabel = options.find((opt) => opt.value === selectedValue)?.label;
    AccessibilityInfo.announceForAccessibility(
      `${label}: ${selectedLabel} selecionado`
    );
  };

  const openModal = (): void => {
    if (disabled) return;
    setModalVisible(true);
    AccessibilityInfo.announceForAccessibility(
      `${label} - Seletor aberto. ${options.length} opções disponíveis`
    );
  };

  return (
    <View style={styles.container}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.label, centerLabel && styles.labelCentered]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[
          styles.select,
          error && styles.selectError,
          disabled && styles.selectDisabled,
        ]}
        onPress={openModal}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel ||
          `${label}. ${selectedOption ? `Selecionado: ${selectedOption.label}` : placeholder}`
        }
        accessibilityHint={
          accessibilityHint ||
          'Toque duas vezes para abrir o seletor'
        }
        accessibilityState={{ disabled }}
        {...accessibilityProps}
      >
        <Text
          style={[
            styles.selectText,
            !selectedOption && styles.placeholder,
          ]}
        >
          {selectedOption ? (
            <>
              {selectedOption.emoji && <Text style={styles.selectEmoji}>{selectedOption.emoji} </Text>}
              {selectedOption.label}
            </>
          ) : placeholder}
        </Text>
        <Ionicons
          name={modalVisible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={disabled ? colors.neutral[400] : colors.neutral[600]}
        />
      </TouchableOpacity>

      {error && (
        <Text
          style={styles.errorText}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Fechar seletor"
                accessibilityHint="Toque duas vezes para fechar"
              >
                <Ionicons name="close" size={24} color={colors.neutral[700]} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityHint="Toque duas vezes para selecionar"
                  accessibilityState={{ selected: item.value === value }}
                >
                  <>
                    {item.emoji && <Text style={styles.selectEmoji}>{item.emoji} </Text>}
                    <Text
                      style={[
                        styles.optionText,
                        item.value === value && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </>
                  {item.value === value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary[600]}
                    />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  emoji: {
    ...standardStyles.titleEmoji,
    marginBottom: spacing.xs,
  },
  label: {
    ...standardStyles.fieldLabel,
    marginBottom: spacing.sm,
  },
  labelCentered: {
    textAlign: 'center',
  },
  required: {
    color: colors.error.main,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 50,
  },
  selectError: {
    borderColor: colors.error.main,
  },
  selectDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  selectText: {
    ...standardStyles.fieldValue,
    flex: 1,
  },
  selectEmoji: {
    ...standardStyles.selectEmoji,
  },
  placeholder: {
    color: colors.neutral[400],
  },
  errorText: {
    ...typography.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral[50],
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: 56,
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
});
