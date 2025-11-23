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
import { PieChart } from 'react-native-chart-kit';
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

  const chartData = data?.wasteTypeDistribution.slice(0, 5).map((item, index) => {
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
  }) || [];

  const treatmentChartData = data?.treatmentTypeDistribution.map((item, index) => {
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
            <Text
              style={styles.sectionTitle}
              accessible={true}
              accessibilityRole="header"
            >
              Distribuição por Tipo de Resíduo
            </Text>

            <Card
              accessible={true}
              accessibilityLabel="Gráfico de pizza mostrando distribuição de resíduos por tipo"
              accessibilityHint="Role para ver a lista detalhada abaixo"
            >
              <View style={styles.chartTitleContainer}>
                <Ionicons name="pie-chart" size={20} color={colors.primary[600]} />
                <Text style={styles.chartTitle}>Tipos de Resíduo</Text>
              </View>
              <PieChart
                data={chartData}
                width={Dimensions.get('window').width - 64}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card>

            <View
              accessible={true}
              accessibilityRole="list"
              accessibilityLabel={`Lista de ${data?.wasteTypeDistribution.length} tipos de resíduos`}
            >
              {data?.wasteTypeDistribution.map((item, index) => (
                <Card
                  key={item.wasteTypeId}
                  style={styles.wasteCard}
                  accessible={true}
                  accessibilityRole="text"
                  accessibilityLabel={`${item.wasteTypeName}: ${formatNumber(item.totalWeightKg, 2)} quilogramas, ${item.count} coletas, ${formatNumber(item.percentage, 1)} porcento do total`}
                >
                  <View style={styles.wasteInfo}>
                    <Text style={styles.wasteName}>{item.wasteTypeName}</Text>
                    <Text style={styles.wasteCategory}>{item.category}</Text>
                  </View>
                  <View style={styles.wasteStats}>
                    <Text style={styles.wasteWeight}>
                      {formatNumber(item.totalWeightKg, 2)}kg
                    </Text>
                    <Text style={styles.wasteCount}>{item.count} coletas</Text>
                    <Text style={styles.wastePercent}>
                      {formatNumber(item.percentage, 1)}%
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}

        {treatmentChartData.length > 0 && (
          <>
            <Text
              style={[styles.sectionTitle, { marginTop: spacing['6'] }]}
              accessible={true}
              accessibilityRole="header"
            >
              Distribuição por Tipo de Tratamento
            </Text>

            <Card
              accessible={true}
              accessibilityLabel="Gráfico de pizza mostrando distribuição por tipo de tratamento"
              accessibilityHint="Role para ver a lista detalhada abaixo"
            >
              <View style={styles.chartTitleContainer}>
                <Ionicons name="analytics" size={20} color={colors.secondary[600]} />
                <Text style={styles.chartTitle}>Tipos de Tratamento</Text>
              </View>
              <PieChart
                data={treatmentChartData}
                width={Dimensions.get('window').width - 64}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card>

            <View
              accessible={true}
              accessibilityRole="list"
              accessibilityLabel={`Lista de ${data?.treatmentTypeDistribution.length} tipos de tratamento`}
            >
              {data?.treatmentTypeDistribution.map((item, index) => (
                <Card
                  key={item.treatmentType}
                  style={styles.wasteCard}
                  accessible={true}
                  accessibilityRole="text"
                  accessibilityLabel={`${translateTreatmentType(item.treatmentType as TreatmentType)}: ${formatNumber(item.totalWeightKg, 2)} quilogramas, ${item.count} coletas, ${formatNumber(item.percentage, 1)} porcento do total`}
                >
                  <View style={styles.wasteInfo}>
                    <Text style={styles.wasteName}>
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
                  <View style={styles.wasteStats}>
                    <Text style={styles.wasteWeight}>
                      {formatNumber(item.totalWeightKg, 2)}kg
                    </Text>
                    <Text style={styles.wastePercent}>
                      {formatNumber(item.percentage, 1)}%
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
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
});
