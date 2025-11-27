import React from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { getPeriodLabel } from '@/utils/dateRange.util';
import { DatePeriod, CustomDateRange } from '@/types';
import { CustomDateRangePicker } from './filters/CustomDateRangePicker';

interface DateFilterSelectorProps {
  selectedPeriod: DatePeriod;
  onPeriodChange: (period: DatePeriod) => void;
  customDateRange?: CustomDateRange;
  onCustomDateRangeChange?: (range: CustomDateRange) => void;
}

const periods: DatePeriod[] = ['today', 'week', 'month', 'year', 'custom'];

const periodIcons: Record<DatePeriod, keyof typeof Ionicons.glyphMap> = {
  today: 'today',
  week: 'calendar',
  month: 'calendar-outline',
  year: 'time',
  custom: 'calendar-sharp',
};

export const DateFilterSelector: React.FC<DateFilterSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  customDateRange = { startDate: null, endDate: null },
  onCustomDateRangeChange,
}) => {
  const handlePeriodPress = (period: DatePeriod): void => {
    onPeriodChange(period);
    AccessibilityInfo.announceForAccessibility(
      `Período alterado para ${getPeriodLabel(period)}`
    );
  };

  const handleCustomDateRangeChange = (range: CustomDateRange): void => {
    if (onCustomDateRangeChange) {
      onCustomDateRangeChange(range);
    }
  };

  const handleCustomDateRangeApply = (): void => {
    if (selectedPeriod !== 'custom') {
      onPeriodChange('custom');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PERÍODO</Text>

      <View style={styles.quickFiltersRow}>
        {periods.slice(0, 2).map((period) => {
          const isSelected = period === selectedPeriod;
          return (
            <Pressable
              key={period}
              style={({ pressed }) => [
                styles.filterButton,
                isSelected && styles.filterButtonActive,
                pressed && styles.filterButtonPressed,
              ]}
              onPress={() => handlePeriodPress(period)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={getPeriodLabel(period)}
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={`Filtrar dados por ${getPeriodLabel(period)}`}
              android_ripple={{
                color: isSelected ? colors.primary[700] : colors.primary[100],
                borderless: false,
              }}
            >
              <Ionicons
                name={periodIcons[period]}
                size={20}
                color={isSelected ? colors.white : colors.primary[600]}
              />
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {getPeriodLabel(period)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.quickFiltersRow}>
        {periods.slice(2, 4).map((period) => {
          const isSelected = period === selectedPeriod;
          return (
            <Pressable
              key={period}
              style={({ pressed }) => [
                styles.filterButton,
                isSelected && styles.filterButtonActive,
                pressed && styles.filterButtonPressed,
              ]}
              onPress={() => handlePeriodPress(period)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={getPeriodLabel(period)}
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={`Filtrar dados por ${getPeriodLabel(period)}`}
              android_ripple={{
                color: isSelected ? colors.primary[700] : colors.primary[100],
                borderless: false,
              }}
            >
              <Ionicons
                name={periodIcons[period]}
                size={20}
                color={isSelected ? colors.white : colors.primary[600]}
              />
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {getPeriodLabel(period)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.divider} />

      <View style={styles.customPickerContainer}>
        <Text style={styles.customLabel}>Ou escolha um período personalizado:</Text>
        <CustomDateRangePicker
          value={customDateRange}
          onChange={handleCustomDateRangeChange}
          onApply={handleCustomDateRangeApply}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing['5'],
    marginHorizontal: spacing['4'],
    marginBottom: spacing['6'],
    ...shadows.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: spacing['4'],
    letterSpacing: Platform.OS === 'android' ? 0.8 : 1,
  },
  quickFiltersRow: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginBottom: spacing['3'],
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'android' ? spacing['4'] : spacing['3.5'],
    paddingHorizontal: spacing['3'],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary[200],
    gap: spacing['2'],
    minHeight: 48,
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        shadowColor: 'transparent',
      },
    }),
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        ...shadows.xs,
      },
    }),
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing['5'],
  },
  customPickerContainer: {
    marginTop: spacing['2'],
  },
  customLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing['3'],
    includeFontPadding: false,
  },
});
