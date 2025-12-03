import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { collectionsService } from '@/services/collections.service';
import { Collection } from '@/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type NavigationProp = StackNavigationProp<{
  CollectionApproval: { collectionId: string };
}>;

export const PendingCollectionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadCollections = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);

      const response = await collectionsService.getPendingCollections(pageNum, 20);

      if (append) {
        setCollections(prev => [...prev, ...response.data]);
      } else {
        setCollections(response.data);
      }

      setHasMore(response.pagination.page < response.pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Erro ao carregar pesagens pendentes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCollections();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCollections(1, false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadCollections(page + 1, true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const renderItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CollectionApproval', { collectionId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.clientName}>{item.client?.name || 'Cliente desconhecido'}</Text>
        <Text style={styles.date}>{formatDate(item.collectionDate)}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.label}>Unidade:</Text>
        <Text style={styles.value}>{item.unit?.name || 'N/A'}</Text>

        <Text style={styles.label}>Tipo de Resíduo:</Text>
        <Text style={styles.value}>{item.wasteType?.name || 'N/A'}</Text>

        <Text style={styles.label}>Peso:</Text>
        <Text style={styles.value}>
          {item.gravimetricData?.[0]?.weightKg != null
            ? `${Number(item.gravimetricData[0].weightKg).toFixed(2)} kg`
            : 'N/A'}
        </Text>

        <Text style={styles.label}>Destinatário:</Text>
        <Text style={styles.value}>{item.recipient?.name || 'N/A'}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pendente de Aprovação</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && collections.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Carregando pesagens pendentes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={collections}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[600]]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="checkmark-done-circle"
                size={80}
                color={colors.success.main}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>Tudo validado!</Text>
              <Text style={styles.emptyText}>
                Não há pesagens pendentes de aprovação no momento
              </Text>
              <Text style={styles.emptySubtext}>
                As novas pesagens aparecerão aqui para validação
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && collections.length > 0 ? (
            <ActivityIndicator size="small" color={colors.primary[600]} style={styles.footerLoader} />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingBottom: spacing.sm,
  },
  clientName: {
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
    fontSize: 18,
  },
  date: {
    color: '#475569',
    fontSize: 12,
  },
  cardBody: {
    marginVertical: spacing.sm,
  },
  label: {
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
  },
  value: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  badge: {
    backgroundColor: colors.warning.light + '40',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  badgeText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  emptyText: {
    color: '#334155',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  footerLoader: {
    marginVertical: spacing.md,
  },
});
