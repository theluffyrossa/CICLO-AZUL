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
import { recipientService, Recipient } from '@/services/recipient.service';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Props {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

export const RecipientsListScreen = ({ navigation }: Props): React.JSX.Element => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecipients = async (): Promise<void> => {
    try {
      const response = await recipientService.getAll({ page: 1, limit: 100 });
      setRecipients(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os destinatários');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecipients();
    }, [])
  );

  const handleRefresh = (): void => {
    setRefreshing(true);
    loadRecipients();
  };

  const handleAdd = (): void => {
    navigation.navigate('RecipientForm');
  };

  const handleEdit = (recipient: Recipient): void => {
    navigation.navigate('RecipientForm', { recipientId: recipient.id });
  };

  const handleDelete = (recipient: Recipient): void => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o destinatário "${recipient.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await recipientService.delete(recipient.id);
              Alert.alert('Sucesso', 'Destinatário excluído com sucesso');
              loadRecipients();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o destinatário');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Recipient }): React.JSX.Element => (
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
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        {item.document && (
          <View style={styles.infoRow}>
            <Ionicons name="card" size={16} color={colors.neutral[600]} />
            <Text style={styles.infoText}>Doc: {item.document}</Text>
          </View>
        )}

        {item.address && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={colors.neutral[600]} />
            <Text style={styles.infoText}>
              {item.address}
              {item.city && `, ${item.city}`}
              {item.state && ` - ${item.state}`}
            </Text>
          </View>
        )}

        {item.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call" size={16} color={colors.neutral[600]} />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
        )}

        {item.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={16} color={colors.neutral[600]} />
            <Text style={styles.infoText}>{item.email}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
          accessibilityLabel="Editar destinatário"
        >
          <Ionicons name="pencil" size={20} color={colors.primary[600]} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
          accessibilityLabel="Excluir destinatário"
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
        <Text style={styles.title}>Destinatários</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={recipients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyText}>Nenhum destinatário cadastrado</Text>
            <Text style={styles.emptySubtext}>
              Adicione o primeiro destinatário para começar
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <View style={styles.footer}>
        <Button
          title="Adicionar Destinatário"
          onPress={handleAdd}
          icon="add"
          accessibilityLabel="Adicionar novo destinatário"
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
    marginBottom: spacing.xs,
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
  typeBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    color: colors.primary[700],
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
