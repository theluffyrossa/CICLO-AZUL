import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, standardStyles } from '@/theme';
import { wasteTypeService, WasteType } from '@/services/wasteType.service';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Props {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

export const WasteTypesListScreen = ({ navigation }: Props): React.JSX.Element => {
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWasteTypes = async (): Promise<void> => {
    try {
      const response = await wasteTypeService.getAll({ page: 1, limit: 100 });
      setWasteTypes(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os tipos de resíduo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWasteTypes();
    }, [])
  );

  const handleRefresh = (): void => {
    setRefreshing(true);
    loadWasteTypes();
  };

  const handleAdd = (): void => {
    navigation.navigate('WasteTypeForm');
  };

  const handleEdit = (wasteType: WasteType): void => {
    navigation.navigate('WasteTypeForm', { wasteTypeId: wasteType.id });
  };

  const handleDelete = (wasteType: WasteType): void => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o tipo de resíduo "${wasteType.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await wasteTypeService.delete(wasteType.id);
              Alert.alert('Sucesso', 'Tipo de resíduo excluído com sucesso');
              loadWasteTypes();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o tipo de resíduo');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: WasteType }): React.JSX.Element => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={styles.name}>{item.name}</Text>
          {!item.active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inativo</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="pricetag" size={16} color={colors.neutral[600]} />
          <Text style={styles.infoText}>Categoria: {item.category}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="scale" size={16} color={colors.neutral[600]} />
          <Text style={styles.infoText}>Unidade: {item.unit}</Text>
        </View>

        {item.description && (
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={16} color={colors.neutral[600]} />
            <Text style={styles.infoText}>{item.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
          accessibilityLabel="Editar tipo de resíduo"
        >
          <Ionicons name="pencil" size={20} color={colors.primary[600]} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
          accessibilityLabel="Excluir tipo de resíduo"
        >
          <Ionicons name="trash" size={20} color={colors.error[600]} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.title}>Tipos de Resíduo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={wasteTypes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyText}>Nenhum tipo de resíduo cadastrado</Text>
            <Text style={styles.emptySubtext}>
              Adicione o primeiro tipo de resíduo para começar
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <View style={styles.footer}>
        <Button
          title="Adicionar Tipo de Resíduo"
          onPress={handleAdd}
          icon="add"
          accessibilityLabel="Adicionar novo tipo de resíduo"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...standardStyles.h1,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...standardStyles.shadow,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...standardStyles.h3,
    flex: 1,
  },
  inactiveBadge: {
    backgroundColor: colors.error[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    color: colors.error[700],
    fontSize: 12,
    fontWeight: '600',
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
    ...standardStyles.bodyText,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
  },
  deleteButton: {
    backgroundColor: colors.error[50],
  },
  actionButtonText: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  deleteButtonText: {
    color: colors.error[700],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...standardStyles.h3,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    ...standardStyles.secondaryText,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
