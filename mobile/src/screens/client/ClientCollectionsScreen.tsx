import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { clientService } from '../../services/client.service';
import { Collection, CollectionStatus, ApprovalStatus } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import { getFontSizeMultiplier } from '../../theme/dynamicStyles';
import { colors } from '../../theme/colors';
import { cleanWasteTypeName } from '../../utils/translations.util';

type NavigationProp = StackNavigationProp<any>;

export const ClientCollectionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { fontSize } = useSettingsStore();
  const fontMultiplier = getFontSizeMultiplier(fontSize);
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['clientCollections', page],
    queryFn: () => clientService.getMyCollections({ page, limit: 20 }),
  });

  const onRefresh = () => {
    setPage(1);
    refetch();
  };

  const handleCollectionPress = (collection: Collection) => {
    navigation.navigate('ClientCollectionDetail', { collectionId: collection.id });
  };

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => handleCollectionPress(item)}
      accessible={true}
      accessibilityLabel={`Coleta de ${item.wasteType?.name}, ${formatDate(item.collectionDate)}, ${getStatusLabel(item.status)}`}
      accessibilityHint="Toque para ver detalhes"
    >
      <View style={styles.collectionHeader}>
        <View style={styles.collectionInfo}>
          <Text style={[styles.wasteTypeName, { fontSize: 16 * fontMultiplier * 1.1 }]}>
            {cleanWasteTypeName(item.wasteType?.name) || 'Tipo desconhecido'}
          </Text>
          <Text style={[styles.collectionDate, { fontSize: 16 * fontMultiplier }]}>
            {formatDate(item.collectionDate)}
          </Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status, item.approvalStatus)]}>
          <Text style={[styles.statusText, { fontSize: 16 * fontMultiplier * 0.85 }]}>
            {getStatusLabel(item.status, item.approvalStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.collectionDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
          <Text style={[styles.detailText, { fontSize: 16 * fontMultiplier * 0.9 }]}>
            {item.unit?.name || 'Local não especificado'}
          </Text>
        </View>

        {item.gravimetricData && item.gravimetricData.length > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="scale-outline" size={16} color={colors.text.secondary} />
            <Text style={[styles.detailText, { fontSize: 16 * fontMultiplier * 0.9 }]}>
              {item.gravimetricData.reduce((sum, gd) => sum + Number(gd.weightKg), 0).toFixed(1)} kg
            </Text>
          </View>
        )}

        {item.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color={colors.text.secondary} />
            <Text
              style={[styles.detailText, { fontSize: 16 * fontMultiplier * 0.9 }]}
              numberOfLines={2}
            >
              {item.notes}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.collectionFooter}>
        <Text style={[styles.operatorText, { fontSize: 16 * fontMultiplier * 0.85 }]}>
          Operador: {item.user?.name || 'N/A'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral[500]} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { fontSize: 16 * fontMultiplier }]}>
          Carregando coletas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
        <Text style={[styles.errorText, { fontSize: 16 * fontMultiplier }]}>
          Erro ao carregar coletas
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={[styles.retryButtonText, { fontSize: 16 * fontMultiplier }]}>
            Tentar Novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const collections = data?.data || [];
  const pagination = data?.pagination;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: 16 * fontMultiplier * 1.5 }]}>
          Minhas Coletas
        </Text>
        <Text style={[styles.subtitle, { fontSize: 16 * fontMultiplier }]}>
          {pagination?.total || 0} coletas registradas
        </Text>
      </View>

      <FlatList
        data={collections}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={colors.neutral[400]} />
            <Text style={[styles.emptyText, { fontSize: 16 * fontMultiplier }]}>
              Nenhuma coleta registrada ainda
            </Text>
          </View>
        }
        accessible={true}
        accessibilityLabel="Lista de coletas"
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCollection')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Adicionar coleta"
        accessibilityHint="Toque para adicionar uma nova coleta"
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusLabel = (status: CollectionStatus, approvalStatus?: ApprovalStatus): string => {
  if (approvalStatus === ApprovalStatus.REJECTED) {
    return 'Rejeitada';
  }

  const labels: Record<CollectionStatus, string> = {
    SCHEDULED: 'Agendada',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
  };
  return labels[status] || status;
};

const getStatusStyle = (status: CollectionStatus, approvalStatus?: ApprovalStatus) => {
  if (approvalStatus === ApprovalStatus.REJECTED) {
    return { backgroundColor: '#FFEBEE' };
  }

  const styles: Record<CollectionStatus, object> = {
    SCHEDULED: { backgroundColor: colors.primary[100] },
    IN_PROGRESS: { backgroundColor: colors.secondary[100] },
    COMPLETED: { backgroundColor: colors.primary[50] },
    CANCELLED: { backgroundColor: colors.error.light + '30' },
  };
  return styles[status] || { backgroundColor: colors.neutral[100] };
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
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.primary[600],
    padding: 20,
    paddingTop: 60,
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
  listContainer: {
    padding: 16,
  },
  collectionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  wasteTypeName: {
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  collectionDate: {
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  collectionDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: colors.text.secondary,
    flex: 1,
  },
  collectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: 12,
  },
  operatorText: {
    color: colors.neutral[500],
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    color: colors.neutral[500],
    marginTop: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
