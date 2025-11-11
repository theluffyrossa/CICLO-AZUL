import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, FloatingActionButton, EmptyState } from '@/components/common';
import { Loading } from '@/components/common/Loading';
import { collectionsService } from '@/services/collections.service';
import { Collection, CollectionStatus } from '@/types';
import { colors, spacing, borderRadius, standardStyles } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { toNumber, formatNumber } from '@/utils/numbers';

const STATUS_LABELS: Record<CollectionStatus, string> = {
  [CollectionStatus.SCHEDULED]: 'Agendada',
  [CollectionStatus.IN_PROGRESS]: 'Em Andamento',
  [CollectionStatus.COMPLETED]: 'Concluída',
  [CollectionStatus.CANCELLED]: 'Cancelada',
};

const STATUS_COLORS: Record<CollectionStatus, string> = {
  [CollectionStatus.SCHEDULED]: colors.info.main,
  [CollectionStatus.IN_PROGRESS]: colors.warning.main,
  [CollectionStatus.COMPLETED]: colors.success.main,
  [CollectionStatus.CANCELLED]: colors.error.main,
};

const STATUS_ICONS: Record<CollectionStatus, keyof typeof Ionicons.glyphMap> = {
  [CollectionStatus.SCHEDULED]: 'time-outline',
  [CollectionStatus.IN_PROGRESS]: 'hourglass-outline',
  [CollectionStatus.COMPLETED]: 'checkmark-circle',
  [CollectionStatus.CANCELLED]: 'close-circle',
};

export const CollectionsListScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['collections', page],
    queryFn: () => collectionsService.getCollections({ page, limit: 20 }),
  });

  const handleRefresh = (): void => {
    setPage(1);
    refetch();
    AccessibilityInfo.announceForAccessibility('Atualizando lista de coletas');
  };

  const getTotalWeight = (collection: Collection): number => {
    return (
      collection.gravimetricData?.reduce((sum, data) => sum + toNumber(data.weightKg, 0), 0) || 0
    );
  };

  const renderEmptyList = (): JSX.Element => (
    <View
      style={styles.emptyContainer}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel="Nenhuma coleta encontrada"
    >
      <Ionicons name="leaf-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyText}>Nenhuma coleta encontrada</Text>
      <Text style={styles.emptySubtext}>
        As coletas registradas aparecerão aqui
      </Text>
    </View>
  );

  const renderCollectionItem = ({ item, index }: { item: Collection; index: number }): JSX.Element => {
    const totalWeight = getTotalWeight(item);
    const statusLabel = STATUS_LABELS[item.status];
    const statusColor = STATUS_COLORS[item.status];
    const statusIcon = STATUS_ICONS[item.status];

    const formattedDate = format(
      new Date(item.collectionDate),
      "dd 'de' MMMM, HH:mm",
      { locale: ptBR }
    );

    return (
      <TouchableOpacity
        onPress={() => handleCollectionPress(item)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Coleta ${index + 1}: ${item.client?.name}, ${item.wasteType?.name}, ${statusLabel}, ${formattedDate}, Peso total: ${formatNumber(totalWeight, 2)} quilogramas`}
        accessibilityHint="Toque duas vezes para ver detalhes"
      >
        <Card style={styles.collectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.clientInfo}>
              <Ionicons name="business" size={20} color={colors.primary[600]} />
              <Text style={styles.clientName} numberOfLines={1}>
                {item.client?.name}
              </Text>
            </View>
            <View
              style={styles.statusBadge}
              accessible={true}
              accessibilityLabel={`Status: ${statusLabel}`}
            >
              <Ionicons name={statusIcon} size={28} color={statusColor} />
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={colors.gray[600]} />
              <Text style={styles.infoText}>{item.unit?.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="trash" size={16} color={colors.gray[600]} />
              <Text style={styles.infoText}>{item.wasteType?.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color={colors.gray[600]} />
              <Text style={styles.infoText}>{formattedDate}</Text>
            </View>

            {totalWeight > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="scale" size={16} color={colors.gray[600]} />
                <Text style={styles.infoTextBold}>
                  {formatNumber(totalWeight, 2)} kg
                </Text>
              </View>
            )}

            {item.images && item.images.length > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="camera" size={16} color={colors.gray[600]} />
                <Text style={styles.infoText}>
                  {item.images.length} {item.images.length === 1 ? 'foto' : 'fotos'}
                </Text>
              </View>
            )}
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const handleNewCollection = (): void => {
    navigation.navigate('NewCollection' as never);
  };

  const handleCollectionPress = (collection: Collection): void => {
    navigation.navigate('CollectionDetail' as never, { collectionId: collection.id } as never);
  };

  if (isLoading) {
    return <Loading message="Carregando coletas..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data?.data || []}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[colors.primary[600]]}
            accessibilityLabel="Puxe para atualizar lista de coletas"
          />
        }
        accessibilityRole="list"
        accessibilityLabel={`Lista de coletas. Total: ${data?.pagination.total || 0} coletas`}
      />

      {data && data.pagination.total > 0 && (
        <View
          style={styles.paginationInfo}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Mostrando ${data.data.length} de ${data.pagination.total} coletas. Página ${data.pagination.page} de ${data.pagination.totalPages}`}
        >
          <Ionicons name="information-circle" size={16} color={colors.text.secondary} />
          <Text style={styles.paginationText}>
            {data.data.length} de {data.pagination.total} coletas
          </Text>
        </View>
      )}

      <FloatingActionButton
        icon="add"
        onPress={handleNewCollection}
        accessibilityLabel="Criar nova coleta"
        accessibilityHint="Toque duas vezes para criar uma nova coleta"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  collectionCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  clientName: {
    ...standardStyles.secondaryText,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...standardStyles.secondaryText,
    flex: 1,
  },
  infoTextBold: {
    ...standardStyles.secondaryText,
    fontWeight: '600',
    color: colors.primary[600],
  },
  notesContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  notesText: {
    ...standardStyles.secondaryText,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing['3xl'],
  },
  emptyText: {
    ...standardStyles.fieldValue,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    ...standardStyles.secondaryText,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  paginationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  paginationText: {
    ...standardStyles.secondaryText,
  },
});
