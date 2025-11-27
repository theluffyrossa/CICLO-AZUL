import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/theme';

interface CustomDateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface CustomDateRangePickerProps {
  value: CustomDateRange;
  onChange: (range: CustomDateRange) => void;
  onApply: () => void;
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  value,
  onChange,
  onApply,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempRange, setTempRange] = useState<CustomDateRange>(value);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  const getDisplayText = (): string => {
    if (value.startDate && value.endDate) {
      return `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`;
    }
    if (value.startDate) {
      return `${formatDate(value.startDate)} - ?`;
    }
    return 'Selecionar período';
  };

  const handleDayPress = (day: { dateString: string }) => {
    const selectedDate = new Date(day.dateString);

    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      setTempRange({ startDate: selectedDate, endDate: null });
    } else {
      if (selectedDate < tempRange.startDate) {
        setTempRange({ startDate: selectedDate, endDate: tempRange.startDate });
      } else {
        setTempRange({ ...tempRange, endDate: selectedDate });
      }
    }
  };

  const handleApply = () => {
    if (tempRange.startDate && tempRange.endDate) {
      onChange(tempRange);
      setModalVisible(false);
      onApply();
    }
  };

  const handleClear = () => {
    setTempRange({ startDate: null, endDate: null });
  };

  const handleCancel = () => {
    setTempRange(value);
    setModalVisible(false);
  };

  const getMarkedDates = () => {
    const marked: Record<string, unknown> = {};

    if (tempRange.startDate) {
      const startStr = tempRange.startDate.toISOString().split('T')[0];
      marked[startStr] = {
        startingDay: true,
        color: colors.primary[600],
        textColor: 'white',
      };
    }

    if (tempRange.endDate) {
      const endStr = tempRange.endDate.toISOString().split('T')[0];
      marked[endStr] = {
        endingDay: true,
        color: colors.primary[600],
        textColor: 'white',
      };
    }

    if (tempRange.startDate && tempRange.endDate) {
      const start = new Date(tempRange.startDate);
      const end = new Date(tempRange.endDate);
      const current = new Date(start);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateStr = current.toISOString().split('T')[0];
        marked[dateStr] = {
          color: colors.primary[600] + '40',
          textColor: colors.text.primary,
        };
        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.inputButton}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Selecionar período personalizado"
        accessibilityRole="button"
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary[600]} />
        <Text style={styles.inputText}>{getDisplayText()}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Período</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                {!tempRange.startDate
                  ? 'Selecione a data inicial'
                  : !tempRange.endDate
                  ? 'Selecione a data final'
                  : 'Período selecionado'}
              </Text>
              {tempRange.startDate && tempRange.endDate && (
                <Text style={styles.selectedRange}>
                  {formatDate(tempRange.startDate)} até {formatDate(tempRange.endDate)}
                </Text>
              )}
            </View>

            <Calendar
              onDayPress={handleDayPress}
              markedDates={getMarkedDates()}
              markingType="period"
              theme={{
                selectedDayBackgroundColor: colors.primary[600],
                todayTextColor: colors.primary[600],
                arrowColor: colors.primary[600],
                monthTextColor: colors.text.primary,
                textMonthFontWeight: 'bold',
                textDayFontSize: 16,
                textMonthFontSize: 18,
              }}
              monthFormat="MMMM yyyy"
              firstDay={0}
              enableSwipeMonths
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </TouchableOpacity>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.applyButton,
                    !(tempRange.startDate && tempRange.endDate) && styles.disabledButton,
                  ]}
                  onPress={handleApply}
                  disabled={!(tempRange.startDate && tempRange.endDate)}
                >
                  <Text style={styles.applyButtonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: Platform.OS === 'android' ? spacing['4'] : spacing['4'],
    paddingHorizontal: spacing['4'],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary[200],
    gap: spacing['3'],
    minHeight: 56,
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        shadowColor: 'transparent',
      },
    }),
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.default,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['5'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    minHeight: 64,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  instructionContainer: {
    padding: spacing['4'],
    backgroundColor: colors.white,
    marginHorizontal: spacing['5'],
    marginTop: spacing['4'],
    borderRadius: borderRadius.md,
    minHeight: Platform.OS === 'android' ? 64 : 56,
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  selectedRange: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[600],
    textAlign: 'center',
    marginTop: spacing['2'],
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['5'],
    gap: spacing['4'],
    paddingBottom: Platform.OS === 'android' ? spacing['3'] : 0,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing['2'],
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: Platform.OS === 'android' ? spacing['3.5'] : spacing['3'],
    paddingHorizontal: spacing['5'],
    borderRadius: borderRadius.md,
    minWidth: 100,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  clearButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  applyButton: {
    backgroundColor: colors.primary[600],
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  disabledButton: {
    backgroundColor: colors.border.light,
    opacity: 0.5,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
});
