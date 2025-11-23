import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';
import { clientService } from '../../services/client.service';
import { useSettingsStore } from '../../store/settingsStore';
import { getFontSizeMultiplier } from '../../theme/dynamicStyles';
import { colors } from '../../theme/colors';
import { cleanWasteTypeName, translateTreatmentType } from '../../utils/translations.util';
import { DateFilterSelector } from '../../components/DateFilterSelector';
import { DatePeriod, getDateRangeForPeriod } from '../../utils/dateRange.util';
import { TreatmentType } from '../../types';

export const ClientDashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('month');
  const { fontSize } = useSettingsStore();
  const fontMultiplier = getFontSizeMultiplier(fontSize);

  const { data: statistics, isLoading, error, refetch } = useQuery({
    queryKey: ['clientStatistics', selectedPeriod],
    queryFn: () => {
      const filters = getDateRangeForPeriod(selectedPeriod);
      return clientService.getMyStatistics(filters);
    },
  });

  const handlePeriodChange = (period: DatePeriod): void => {
    setSelectedPeriod(period);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { fontSize: 16 * fontMultiplier }]}>
          Carregando estatísticas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
        <Text style={[styles.errorText, { fontSize: 16 * fontMultiplier }]}>
          Erro ao carregar dados
        </Text>
      </View>
    );
  }

  const { summary, wasteTypeDistribution, treatmentTypeDistribution } = statistics || {
    summary: { totalCollections: 0, totalWeightKg: 0 },
    wasteTypeDistribution: [],
    treatmentTypeDistribution: [],
  };

  const chartData = wasteTypeDistribution.slice(0, 5).map((item, index) => {
    const cleanName = cleanWasteTypeName(item.wasteTypeName);
    return {
      name: `kg ${cleanName}`,
      population: item.totalWeightKg,
      color: [
        '#FF6B6B',
        '#4ECDC4',
        '#FFE66D',
        '#95E1D3',
        '#F38181',
      ][index],
      legendFontColor: colors.text.primary,
      legendFontSize: 10,
    };
  });

  const treatmentChartData = treatmentTypeDistribution.map((item, index) => {
    const translatedName = translateTreatmentType(item.treatmentType as TreatmentType);
    const cleanName = cleanWasteTypeName(translatedName);
    return {
      name: `kg ${cleanName}`,
      population: item.totalWeightKg,
      color: [
        '#A8E6CF',
        '#FFD3B6',
        '#FFAAA5',
        '#FF8B94',
      ][index] || '#A8E6CF',
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    };
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      accessible={true}
      accessibilityLabel="Dashboard de estatísticas"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: 16 * fontMultiplier * 1.5 }]}>
          Meu Painel
        </Text>
        <Text style={[styles.subtitle, { fontSize: 16 * fontMultiplier }]}>
          Acompanhe suas coletas e estatísticas
        </Text>
      </View>

      <DateFilterSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View
          style={styles.card}
          accessible={true}
          accessibilityLabel={`Total de coletas: ${summary.totalCollections}`}
        >
          <Ionicons name="cube-outline" size={32} color={colors.primary[600]} />
          <Text style={[styles.cardValue, { fontSize: 16 * fontMultiplier * 1.8 }]}>
            {summary.totalCollections}
          </Text>
          <Text style={[styles.cardLabel, { fontSize: 16 * fontMultiplier }]}>
            Total de Coletas
          </Text>
        </View>

        <View
          style={styles.card}
          accessible={true}
          accessibilityLabel={`Peso total coletado: ${parseFloat(String(summary.totalWeightKg)).toFixed(2)} kg`}
        >
          <Ionicons name="scale-outline" size={32} color={colors.secondary[600]} />
          <Text style={[styles.cardValue, { fontSize: 16 * fontMultiplier * 1.8 }]}>
            {parseFloat(String(summary.totalWeightKg)).toFixed(1)}
          </Text>
          <Text style={[styles.cardLabel, { fontSize: 16 * fontMultiplier }]}>
            kg Coletados
          </Text>
        </View>
      </View>

      {chartData.length > 0 && (
        <>
          <View style={styles.section}>
            <View style={styles.chartTitleContainer}>
              <Ionicons name="pie-chart" size={20} color={colors.primary[600]} />
              <Text style={[styles.sectionTitle, { fontSize: 16 * fontMultiplier * 1.2, marginBottom: 0 }]}>
                Distribuição por Tipo de Resíduo
              </Text>
            </View>

            <View style={styles.chartContainer}>
              <PieChart
                data={chartData}
                width={Dimensions.get('window').width - 72}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
                hasLegend={true}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.listTitle, { fontSize: 16 * fontMultiplier * 1.1 }]}>
              Detalhes por Tipo de Resíduo
            </Text>

            {wasteTypeDistribution.map((item, index) => (
              <View
                key={index}
                style={styles.wasteTypeItem}
                accessible={true}
                accessibilityLabel={`${item.wasteTypeName}: ${parseFloat(String(item.totalWeightKg)).toFixed(2)} kg, ${parseFloat(String(item.percentage)).toFixed(1)}% do total, ${item.count} coletas`}
              >
                <View style={styles.wasteTypeHeader}>
                  <View style={styles.wasteTypeNameContainer}>
                    <Text style={[styles.wasteTypeName, { fontSize: 15 * fontMultiplier }]}>
                      {cleanWasteTypeName(item.wasteTypeName)}
                    </Text>
                    <Text style={[styles.wasteTypeCategory, { fontSize: 11 * fontMultiplier }]}>
                      {item.category}
                    </Text>
                  </View>
                  <View style={styles.wasteTypeStats}>
                    <Text style={[styles.wasteTypeWeight, { fontSize: 17 * fontMultiplier }]}>
                      {parseFloat(String(item.totalWeightKg)).toFixed(1)} kg
                    </Text>
                    <Text style={[styles.wasteTypeCount, { fontSize: 12 * fontMultiplier }]}>
                      {item.count} coletas
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${parseFloat(String(item.percentage))}%`,
                        backgroundColor: getCategoryColor(item.category),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.wasteTypePercentage, { fontSize: 13 * fontMultiplier }]}>
                  {parseFloat(String(item.percentage)).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {treatmentChartData.length > 0 && (
        <>
          <View style={styles.section}>
            <View style={styles.chartTitleContainer}>
              <Ionicons name="analytics" size={20} color={colors.secondary[600]} />
              <Text style={[styles.sectionTitle, { fontSize: 16 * fontMultiplier * 1.2, marginBottom: 0 }]}>
                Distribuição por Tipo de Tratamento
              </Text>
            </View>

            <View style={styles.chartContainer}>
              <PieChart
                data={treatmentChartData}
                width={Dimensions.get('window').width - 72}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
                hasLegend={true}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.listTitle, { fontSize: 16 * fontMultiplier * 1.1 }]}>
              Detalhes por Tipo de Tratamento
            </Text>

            {treatmentTypeDistribution.map((item, index) => (
              <View
                key={index}
                style={styles.treatmentItem}
                accessible={true}
                accessibilityLabel={`${translateTreatmentType(item.treatmentType as TreatmentType)}: ${parseFloat(String(item.totalWeightKg)).toFixed(2)} kg, ${parseFloat(String(item.percentage)).toFixed(1)}% do total, ${item.count} coletas`}
              >
                <View style={styles.treatmentHeader}>
                  <Text style={[styles.treatmentName, { fontSize: 15 * fontMultiplier }]}>
                    {translateTreatmentType(item.treatmentType as TreatmentType)}
                  </Text>
                  <View
                    style={[
                      styles.treatmentBadge,
                      {
                        backgroundColor: [
                          colors.primary[100],
                          colors.secondary[100],
                          colors.primary[200],
                          colors.secondary[200],
                        ][index] || colors.primary[100],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.treatmentBadgeText,
                        {
                          fontSize: 10 * fontMultiplier,
                          color: [
                            colors.primary[700],
                            colors.secondary[700],
                            colors.primary[800],
                            colors.secondary[800],
                          ][index] || colors.primary[600],
                        },
                      ]}
                    >
                      {item.count} coletas
                    </Text>
                  </View>
                </View>
                <View style={styles.treatmentStats}>
                  <Text style={[styles.treatmentWeight, { fontSize: 17 * fontMultiplier }]}>
                    {parseFloat(String(item.totalWeightKg)).toFixed(1)} kg
                  </Text>
                  <Text style={[styles.treatmentPercentage, { fontSize: 15 * fontMultiplier }]}>
                    {parseFloat(String(item.percentage)).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {wasteTypeDistribution.length === 0 && (
        <View style={[styles.section, styles.emptyState]}>
          <Ionicons name="leaf-outline" size={48} color="#ccc" />
          <Text style={[styles.emptyText, { fontSize: 16 * fontMultiplier }]}>
            Nenhuma coleta registrada ainda
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    ORGANIC: colors.primary[500],
    RECYCLABLE: colors.secondary[500],
    HAZARDOUS: colors.primary[800],
    ELECTRONIC: colors.secondary[700],
    CONSTRUCTION: colors.primary[400],
    OTHER: colors.secondary[400],
  };
  return categoryColors[category] || colors.primary[600];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: colors.error.main,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.primary[600],
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.white,
    opacity: 0.9,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardValue: {
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 8,
  },
  cardLabel: {
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 0,
    flex: 1,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  listTitle: {
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: colors.text.tertiary,
    marginTop: 12,
    textAlign: 'center',
  },
  wasteTypeItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  wasteTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  wasteTypeNameContainer: {
    flex: 1,
    paddingRight: 12,
  },
  wasteTypeName: {
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 15,
    marginBottom: 4,
  },
  wasteTypeCategory: {
    color: colors.text.tertiary,
    marginTop: 2,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  wasteTypeStats: {
    alignItems: 'flex-end',
  },
  wasteTypeWeight: {
    fontWeight: '700',
    color: colors.primary[600],
    fontSize: 17,
  },
  wasteTypeCount: {
    color: colors.text.tertiary,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: colors.neutral[100],
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  wasteTypePercentage: {
    color: colors.text.secondary,
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 13,
  },
  treatmentItem: {
    marginBottom: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  treatmentName: {
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    fontSize: 15,
    paddingRight: 12,
  },
  treatmentBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  treatmentBadgeText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  treatmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  treatmentWeight: {
    fontWeight: '700',
    color: colors.secondary[600],
    fontSize: 17,
  },
  treatmentPercentage: {
    fontWeight: '700',
    color: colors.text.secondary,
    fontSize: 15,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
});
