import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  AccessibilityInfo,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { useQuery } from '@tanstack/react-query';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { DateFilterSelector } from '@/components/DateFilterSelector';
import { ClientFilterSelector } from '@/components/ClientFilterSelector';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api.service';
import { clientsService } from '@/services/clients.service';
import { exportService } from '@/services/export.service';
import { DashboardData, ApiResponse, DashboardFilters, TreatmentType, UserRole } from '@/types';
import { colors, spacing, shadows, standardStyles, borderRadius, typography } from '@/theme';
import { formatNumber } from '@/utils/numbers';
import { DatePeriod, getDateRangeForPeriod } from '@/utils/dateRange.util';
import { translateTreatmentType, cleanWasteTypeName } from '@/utils/translations.util';
import { getWasteTypeIcon } from '@/utils/wasteTypeIcons.util';

const fetchDashboard = async (filters?: DashboardFilters): Promise<DashboardData> => {
  const params = new URLSearchParams();

  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  if (filters?.clientId) {
    params.append('clientId', filters.clientId);
  }

  const url = `/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await api.get<ApiResponse<DashboardData>>(url);
  if (!response.data.data) throw new Error('Dados não encontrados');
  return response.data.data;
};

export const DashboardScreen = (): React.JSX.Element => {
  const { user, logout } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('month');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsService.getClients({ limit: 1000 }),
    enabled: isAdmin,
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard', selectedPeriod, selectedClientId],
    queryFn: () => {
      const filters: DashboardFilters = {
        ...getDateRangeForPeriod(selectedPeriod),
        ...(selectedClientId && { clientId: selectedClientId }),
      };
      return fetchDashboard(filters);
    },
  });

  const handlePeriodChange = (period: DatePeriod): void => {
    setSelectedPeriod(period);
  };

  const handleClientChange = (clientId: string | null): void => {
    setSelectedClientId(clientId);
    AccessibilityInfo.announceForAccessibility(
      clientId ? 'Filtro de cliente aplicado' : 'Mostrando todos os clientes'
    );
  };

  const handleRefresh = (): void => {
    refetch();
    AccessibilityInfo.announceForAccessibility('Atualizando dados do dashboard');
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    AccessibilityInfo.announceForAccessibility('Logout realizado com sucesso');
  };

  const handleExportPDF = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const filters = {
        ...getDateRangeForPeriod(selectedPeriod),
        ...(selectedClientId && { clientId: selectedClientId }),
      };
      await exportService.exportPDF(filters);
      AccessibilityInfo.announceForAccessibility('Relatório PDF exportado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha ao exportar PDF. Tente novamente.';
      Alert.alert('Erro ao Exportar PDF', errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const filters = {
        ...getDateRangeForPeriod(selectedPeriod),
        ...(selectedClientId && { clientId: selectedClientId }),
      };
      await exportService.exportCSV(filters);
      AccessibilityInfo.announceForAccessibility('Relatório CSV exportado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha ao exportar CSV. Tente novamente.';
      Alert.alert('Erro ao Exportar CSV', errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Carregando dashboard..." />;
  }

  const wasteTypeColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#FFD93D',
    '#38BDF8',
    '#A78BFA',
    '#FB7185',
    '#2B87F5',
    '#FBBF24',
  ];

  const treatmentTypeColors = [
    '#0EA5E9',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
  ];

  const getWasteTypeColor = (index: number): string => {
    return wasteTypeColors[index % wasteTypeColors.length];
  };

  const getTreatmentTypeColor = (index: number): string => {
    return treatmentTypeColors[index % treatmentTypeColors.length];
  };

  const chartData = data?.wasteTypeDistribution.slice(0, 5).map((item, index) => {
    return {
      value: item.totalWeightKg,
      label: '',
      frontColor: getWasteTypeColor(index),
    };
  }) || [];

  const treatmentChartData = data?.treatmentTypeDistribution.map((item, index) => {
    return {
      value: item.totalWeightKg,
      label: '',
      frontColor: getTreatmentTypeColor(index),
    };
  }) || [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[colors.primary[600]]}
            accessibilityLabel="Puxe para atualizar"
          />
        }
      >
        <View
          style={styles.userCard}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Bem-vindo, ${user?.name}. Perfil: ${user?.role}`}
        >
          <View style={styles.userInfo}>
            <Ionicons
              name={user?.role === 'ADMIN' ? 'shield-checkmark' : 'person'}
              size={32}
              color={colors.primary[600]}
            />
            <View>
              <Text style={styles.welcomeText}>Bem-vindo,</Text>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>{user?.role}</Text>
            </View>
          </View>
          <Button
            title="Sair"
            onPress={handleLogout}
            variant="outline"
            size="sm"
            accessibilityLabel="Fazer logout"
            accessibilityHint="Toque para sair do aplicativo"
          />
        </View>

        <DateFilterSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        />

        {isAdmin && (
          <ClientFilterSelector
            clients={clientsData?.data || []}
            selectedClientId={selectedClientId}
            onClientChange={handleClientChange}
            loading={isLoadingClients}
          />
        )}

        <Card
          style={styles.exportCard}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Seção de exportação de relatórios"
        >
          <View style={styles.exportHeader}>
            <Ionicons name="download-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.exportTitle}>Exportar Relatórios</Text>
          </View>
          <Text style={styles.exportDescription}>
            Baixe os dados das coletas filtradas em PDF ou CSV
          </Text>
          <View style={styles.exportButtons}>
            <View style={styles.exportButton}>
              <Button
                title="Baixar PDF"
                onPress={handleExportPDF}
                variant="outline"
                size="sm"
                disabled={isExporting}
                accessibilityLabel="Exportar relatório em PDF"
                accessibilityHint="Baixa um arquivo PDF com os dados filtrados"
              />
            </View>
            <View style={styles.exportButton}>
              <Button
                title="Baixar CSV"
                onPress={handleExportCSV}
                variant="outline"
                size="sm"
                disabled={isExporting}
                accessibilityLabel="Exportar relatório em CSV"
                accessibilityHint="Baixa um arquivo CSV com os dados filtrados"
              />
            </View>
          </View>
        </Card>

        <View
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel="Resumo Geral"
          style={{ marginBottom: spacing.lg }}
        >
          <Text style={standardStyles.sectionTitle}>Resumo Geral</Text>
        </View>

        <View style={styles.statsGrid}>
          <Card
            style={styles.statCard}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`Total de coletas: ${data?.summary.totalCollections || 0}`}
          >
            <Ionicons name="list" size={32} color={colors.primary[600]} />
            <Text style={styles.statValue}>{data?.summary.totalCollections || 0}</Text>
            <Text style={styles.statLabel}>Coletas</Text>
          </Card>

          <Card
            style={styles.statCard}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`Peso total: ${formatNumber(data?.summary.totalWeightKg, 2)} quilogramas`}
          >
            <Ionicons name="scale" size={32} color={colors.secondary[600]} />
            <Text style={styles.statValue}>
              {formatNumber(data?.summary.totalWeightKg, 1)}kg
            </Text>
            <Text style={styles.statLabel}>Peso Total</Text>
          </Card>

          <Card
            style={styles.statCard}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`Clientes ativos: ${data?.summary.activeClients || 0}`}
          >
            <Ionicons name="people" size={32} color={colors.primary[400]} />
            <Text style={styles.statValue}>{data?.summary.activeClients || 0}</Text>
            <Text style={styles.statLabel}>Clientes</Text>
          </Card>

          <Card
            style={styles.statCard}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`Unidades ativas: ${data?.summary.activeUnits || 0}`}
          >
            <Ionicons name="business" size={32} color={colors.secondary[800]} />
            <Text style={styles.statValue}>{data?.summary.activeUnits || 0}</Text>
            <Text style={styles.statLabel}>Unidades</Text>
          </Card>
        </View>

        {chartData.length > 0 && (
          <>
            <Card
              accessible={true}
              accessibilityLabel="Gráfico de barras mostrando distribuição de resíduos por tipo"
              accessibilityHint="Role para ver a lista detalhada abaixo"
            >
              <View style={styles.chartTitleContainer}>
                <Ionicons name="pie-chart" size={20} color={colors.primary[600]} />
                <Text style={styles.chartTitle}>Distribuição por Tipo de Resíduo</Text>
              </View>

              <View style={styles.chartContainerLeft}>
                <BarChart
                  data={chartData}
                  width={Dimensions.get('window').width - 80}
                  height={Math.max(chartData.length * 60, 100)}
                  barWidth={28}
                  spacing={24}
                  hideRules
                  horizontal
                  showYAxisIndices={false}
                  hideYAxisText
                  xAxisThickness={1}
                  xAxisColor={colors.border.light}
                  yAxisThickness={0}
                  isAnimated
                  animationDuration={800}
                  barBorderRadius={4}
                />
              </View>

              <Text style={[styles.listTitle, { marginTop: spacing['4'] }]}>
                Detalhes por Tipo de Resíduo
              </Text>

              {data?.wasteTypeDistribution.map((item, index) => (
                <View
                  key={item.wasteTypeId}
                  style={styles.wasteTypeItem}
                  accessible={true}
                  accessibilityLabel={`${cleanWasteTypeName(item.wasteTypeName)}: ${formatNumber(item.totalWeightKg, 2)} quilogramas, ${formatNumber(item.percentage, 1)} porcento do total, ${item.count} coletas`}
                >
                  <View style={styles.wasteTypeHeader}>
                    <View style={styles.wasteTypeNameContainer}>
                      <View style={styles.wasteTypeNameRow}>
                        <View style={[styles.iconContainer, { backgroundColor: getWasteTypeColor(index) + '15' }]}>
                          <Ionicons
                            name={getWasteTypeIcon(item.wasteTypeName)}
                            size={22}
                            color={getWasteTypeColor(index)}
                          />
                        </View>
                        <Text style={styles.wasteName}>
                          {cleanWasteTypeName(item.wasteTypeName)}
                        </Text>
                      </View>
                      <Text style={styles.wasteCategory}>{item.category}</Text>
                    </View>
                    <View style={styles.wasteStats}>
                      <Text style={[styles.wasteWeight, { color: getWasteTypeColor(index) }]}>
                        {formatNumber(item.totalWeightKg, 1)} kg
                      </Text>
                      <Text style={styles.wasteCount}>{item.count} coletas</Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}

        {treatmentChartData.length > 0 && (
          <>
            <Card
              style={{ marginTop: spacing['6'] }}
              accessible={true}
              accessibilityLabel="Gráfico de barras mostrando distribuição por tipo de tratamento"
              accessibilityHint="Role para ver a lista detalhada abaixo"
            >
              <View style={styles.chartTitleContainer}>
                <Ionicons name="analytics" size={20} color={colors.secondary[600]} />
                <Text style={styles.chartTitle}>Distribuição por Tipo de Tratamento</Text>
              </View>

              <View style={styles.chartContainerLeft}>
                <BarChart
                  data={treatmentChartData}
                  width={Dimensions.get('window').width - 80}
                  height={Math.max(treatmentChartData.length * 60, 100)}
                  barWidth={32}
                  spacing={32}
                  hideRules
                  horizontal
                  showYAxisIndices={false}
                  hideYAxisText
                  xAxisThickness={1}
                  xAxisColor={colors.border.light}
                  yAxisThickness={0}
                  isAnimated
                  animationDuration={800}
                  barBorderRadius={4}
                />
              </View>

              <Text style={[styles.listTitle, { marginTop: spacing['4'] }]}>
                Detalhes por Tipo de Tratamento
              </Text>

              {data?.treatmentTypeDistribution.map((item, index) => (
                <View
                  key={item.treatmentType}
                  style={styles.treatmentItem}
                  accessible={true}
                  accessibilityLabel={`${translateTreatmentType(item.treatmentType as TreatmentType)}: ${formatNumber(item.totalWeightKg, 2)} quilogramas, ${formatNumber(item.percentage, 1)} porcento do total, ${item.count} coletas`}
                >
                  <View style={styles.treatmentHeader}>
                    <View style={styles.treatmentNameRow}>
                      <View style={[styles.colorIndicator, { backgroundColor: getTreatmentTypeColor(index) }]} />
                      <Text style={styles.treatmentName}>
                        {translateTreatmentType(item.treatmentType as TreatmentType)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.treatmentBadge,
                        {
                          backgroundColor: getTreatmentTypeColor(index) + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.treatmentBadgeText,
                          {
                            color: getTreatmentTypeColor(index),
                          },
                        ]}
                      >
                        {item.count} coletas
                      </Text>
                    </View>
                  </View>
                  <View style={styles.treatmentStats}>
                    <Text style={[styles.treatmentWeight, { color: getTreatmentTypeColor(index) }]}>
                      {formatNumber(item.totalWeightKg, 1)} kg
                    </Text>
                    <Text style={styles.treatmentPercentage}>
                      {formatNumber(item.percentage, 1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}
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
    padding: spacing['4'],
    paddingBottom: spacing['10'],
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['5'],
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing['6'],
    ...shadows.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.tertiary,
  },
  userName: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  userRole: {
    fontSize: 11,
    color: colors.primary[600],
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing['4'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    marginBottom: spacing['8'],
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    padding: spacing['5'],
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing['2'],
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: spacing['1'],
  },
  wasteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
    padding: spacing['4'],
  },
  wasteInfo: {
    flex: 1,
  },
  wasteName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  wasteCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
    marginTop: spacing['1'],
  },
  wasteStats: {
    alignItems: 'flex-end',
  },
  wasteWeight: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.primary[600],
  },
  wasteCount: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
    marginTop: 2,
  },
  wastePercent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary[600],
    marginTop: 2,
  },
  treatmentBadge: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: borderRadius.full,
    marginTop: spacing['2'],
    alignSelf: 'flex-start',
  },
  treatmentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['4'],
    paddingBottom: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  exportCard: {
    marginBottom: spacing['6'],
    padding: spacing['5'],
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginBottom: spacing['2'],
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  exportDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing['4'],
  },
  exportButtons: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  exportButton: {
    flex: 1,
  },
  chartContainerLeft: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical: spacing['2'],
    marginLeft: -60,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing['4'],
  },
  wasteTypeItem: {
    marginBottom: spacing['4'],
    paddingBottom: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  wasteTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wasteTypeNameContainer: {
    flex: 1,
    paddingRight: spacing['3'],
  },
  wasteTypeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['1'],
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treatmentItem: {
    marginBottom: spacing['4'],
    paddingBottom: spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  treatmentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    flex: 1,
    paddingRight: spacing['3'],
  },
  treatmentName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  treatmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  treatmentWeight: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.secondary[600],
  },
  treatmentPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.secondary,
  },
});
