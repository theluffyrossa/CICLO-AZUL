import React from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/theme';
import { DatePeriod, getPeriodLabel } from '@/utils/dateRange.util';

interface DateFilterSelectorProps {
  selectedPeriod: DatePeriod;
  onPeriodChange: (period: DatePeriod) => void;
}

const periods: DatePeriod[] = ['today', 'week', 'month', 'year'];

const periodIcons: Record<DatePeriod, keyof typeof Ionicons.glyphMap> = {
  today: 'today',
  week: 'calendar',
  month: 'calendar-outline',
  year: 'time',
};

export const DateFilterSelector: React.FC<DateFilterSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const handlePeriodPress = (period: DatePeriod): void => {
    onPeriodChange(period);
    AccessibilityInfo.announceForAccessibility(
      `Período alterado para ${getPeriodLabel(period)}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Período</Text>
      <View style={styles.filtersContainer}>
        {periods.map((period) => {
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
            >
              <Ionicons
                name={periodIcons[period]}
                size={16}
                color={isSelected ? colors.white : colors.primary[600]}
                style={styles.icon}
              />
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {getPeriodLabel(period)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['6'],
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: spacing['3'],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: spacing['3'],
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['2.5'],
    paddingHorizontal: spacing['4'],
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    minHeight: 42,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  icon: {
    marginRight: spacing['2'],
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
    letterSpacing: 0.3,
  },
  filterTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
});
