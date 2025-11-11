import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  AccessibilityProps,
  AccessibilityInfo,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors, spacing, borderRadius, typography, standardStyles } from '@/theme';
import { Button } from '@/components/common';

interface DateTimePickerProps extends AccessibilityProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  emoji?: string;
}

export const DateTimePickerInput: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  mode = 'datetime',
  placeholder,
  error,
  disabled = false,
  required = false,
  minimumDate,
  maximumDate,
  emoji,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  const [show, setShow] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const formatValue = (date: Date): string => {
    if (!date) return '';

    switch (mode) {
      case 'date':
        return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'time':
        return format(date, 'HH:mm');
      case 'datetime':
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      default:
        return '';
    }
  };

  const handlePress = (): void => {
    if (disabled) return;

    if (mode === 'datetime') {
      setPickerMode('date');
    } else {
      setPickerMode(mode);
    }

    setTempDate(value || new Date());
    setShow(true);
    console.log(`[DateTimePicker] Opening picker - Platform: ${Platform.OS}, Mode: ${mode}, PickerMode: ${pickerMode === 'date' ? 'date' : 'time'}`);
    AccessibilityInfo.announceForAccessibility(
      `${label} - Seletor de ${mode === 'date' ? 'data' : mode === 'time' ? 'hora' : 'data e hora'} aberto`
    );
  };

  const handleChange = (event: any, selectedDate?: Date): void => {
    if (Platform.OS === 'android') {
      setShow(false);

      if (event.type === 'dismissed' || !selectedDate) {
        setPickerMode('date');
        return;
      }

      // No Android, confirmamos imediatamente
      if (mode === 'datetime' && pickerMode === 'date') {
        setTempDate(selectedDate);
        setPickerMode('time');
        setShow(true);
        AccessibilityInfo.announceForAccessibility('Agora selecione a hora');
      } else {
        onChange(selectedDate);
        setPickerMode('date');
        AccessibilityInfo.announceForAccessibility(
          `${label}: ${formatValue(selectedDate)} selecionado`
        );
      }
    } else {
      // iOS: apenas atualiza tempDate
      if (event.type === 'dismissed') {
        setShow(false);
        setPickerMode('date');
        return;
      }

      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = (): void => {
    if (mode === 'datetime' && pickerMode === 'date') {
      setPickerMode('time');
      AccessibilityInfo.announceForAccessibility('Agora selecione a hora');
    } else {
      onChange(tempDate);
      setShow(false);
      setPickerMode('date');
      AccessibilityInfo.announceForAccessibility(
        `${label}: ${formatValue(tempDate)} selecionado`
      );
    }
  };

  const handleCancel = (): void => {
    setShow(false);
    setPickerMode('date');
    setTempDate(value || new Date());
    AccessibilityInfo.announceForAccessibility('Seleção cancelada');
  };

  const getIcon = (): 'calendar-outline' | 'time-outline' => {
    switch (mode) {
      case 'time':
        return 'time-outline';
      case 'date':
      case 'datetime':
      default:
        return 'calendar-outline';
    }
  };

  const getPickerTitle = (): string => {
    if (mode === 'datetime') {
      return pickerMode === 'date' ? 'Selecione a data' : 'Selecione a hora';
    }
    return mode === 'date' ? 'Selecione a data' : 'Selecione a hora';
  };

  return (
    <View style={styles.container}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel ||
          `${label}. ${value ? `Selecionado: ${formatValue(value)}` : placeholder || 'Nenhum valor selecionado'}`
        }
        accessibilityHint={
          accessibilityHint ||
          `Toque duas vezes para selecionar ${mode === 'date' ? 'data' : mode === 'time' ? 'hora' : 'data e hora'}`
        }
        accessibilityState={{ disabled }}
        {...accessibilityProps}
      >
        <Ionicons
          name={getIcon()}
          size={20}
          color={disabled ? colors.neutral[400] : colors.neutral[600]}
          style={styles.icon}
        />
        <Text
          style={[
            styles.inputText,
            !value && styles.placeholderText,
          ]}
        >
          {value ? formatValue(value) : (placeholder || 'Selecione...')}
        </Text>
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

      {show && Platform.OS === 'ios' && (
        <Modal
          visible={show}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCancel}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity
                  onPress={handleCancel}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar seletor"
                  accessibilityHint="Toque duas vezes para cancelar"
                >
                  <Ionicons name="close" size={24} color={colors.neutral[700]} />
                </TouchableOpacity>
              </View>

              <View style={styles.pickerModeContainer}>
                <Text style={styles.pickerModeText}>{getPickerTitle()}</Text>
              </View>

              <DateTimePicker
                value={tempDate}
                mode={pickerMode}
                display="spinner"
                onChange={(event, date) => {
                  if (date) {
                    setTempDate(date);
                  }
                }}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="pt-BR"
                textColor={colors.neutral[900]}
              />

              <View style={styles.modalActions}>
                <Button
                  title={mode === 'datetime' && pickerMode === 'date' ? 'Próximo' : 'Concluído'}
                  variant="primary"
                  onPress={handleConfirm}
                  fullWidth
                  accessibilityLabel={mode === 'datetime' && pickerMode === 'date' ? 'Próximo' : 'Concluído'}
                  accessibilityHint={
                    mode === 'datetime' && pickerMode === 'date'
                      ? 'Toque duas vezes para ir para seleção de hora'
                      : 'Toque duas vezes para confirmar a seleção'
                  }
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode={pickerMode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
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
  required: {
    color: colors.error.main,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  inputDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  icon: {
    marginRight: spacing.sm,
  },
  inputText: {
    ...standardStyles.fieldValue,
    flex: 1,
  },
  placeholderText: {
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  pickerModeContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pickerModeText: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
  modalActions: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  androidModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  androidModalContent: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
  },
  androidPickerContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
