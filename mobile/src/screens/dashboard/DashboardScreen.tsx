import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api.service';
import { DashboardData, ApiResponse } from '@/types';
import { colors, spacing, shadows, standardStyles } from '@/theme';
import { toNumber, formatNumber } from '@/utils/numbers';

const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await api.get<ApiResponse<DashboardData>>('/dashboard');
  if (!response.data.data) throw new Error('Dados não encontrados');
  return response.data.data;
};

export const DashboardScreen = (): JSX.Element => {
  const { user, logout } = useAuthStore();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  const handleRefresh = (): void => {
    refetch();
    AccessibilityInfo.announceForAccessibility('Atualizando dados do dashboard');
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    AccessibilityInfo.announceForAccessibility('Logout realizado com sucesso');
  };

  if (isLoading) {
    return <Loading message="Carregando dashboard..." />;
  }

  const chartData = data?.wasteTypeDistribution.slice(0, 5).map((item, index) => ({
    name: item.wasteTypeName,
    population: item.totalWeightKg,
    color: [
      colors.primary[600],
      colors.secondary[600],
      colors.warning.main,
      colors.error.main,
      colors.info.main,
    ][index],
    legendFontColor: colors.text.primary,
    legendFontSize: 12,
  })) || [];

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
            <Ionicons name="people" size={32} color={colors.warning.main} />
            <Text style={styles.statValue}>{data?.summary.activeClients || 0}</Text>
            <Text style={styles.statLabel}>Clientes</Text>
          </Card>

          <Card
            style={styles.statCard}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`Unidades ativas: ${data?.summary.activeUnits || 0}`}
          >
            <Ionicons name="business" size={32} color={colors.error.main} />
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
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.lg,
    ...shadows.base,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  userRole: {
    fontSize: 12,
    color: colors.primary[600],
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.lg,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  wasteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    padding: spacing.md,
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
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  wasteStats: {
    alignItems: 'flex-end',
  },
  wasteWeight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  wasteCount: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  wastePercent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary[600],
  },
});
