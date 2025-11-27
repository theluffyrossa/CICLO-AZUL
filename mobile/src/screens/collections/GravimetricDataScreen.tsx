import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  AccessibilityInfo,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { NumericInput, TextArea } from '@/components/forms';
import { Button, Card, Loading, EmptyState, Toast, FloatingActionButton } from '@/components/common';
import { gravimetricDataService, GravimetricData } from '@/services/gravimetricData.service';
import { useOfflineStore } from '@/store/offlineStore';
import { offlineService } from '@/services/offline.service';
import { useCSVImport, CSVRow } from '@/hooks/useCSVImport';
import { useScaleConnection } from '@/hooks/useScaleConnection';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { toNumber, formatNumber } from '@/utils/numbers';

type RouteParams = {
  GravimetricData: {
    collectionId: number;
  };
};

export const GravimetricDataScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'GravimetricData'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { isOnline } = useOfflineStore();

  const { collectionId } = route.params;

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [materialType, setMaterialType] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCSVPreview, setShowCSVPreview] = useState(false);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [scaleDeviceId, setScaleDeviceId] = useState('SCALE_001'); // Default scale ID

  const { pickAndParseCSV, isProcessing: isImportingCSV } = useCSVImport();

  const {
    isConnected: scaleConnected,
    isConnecting: scaleConnecting,
    latestWeight: scaleWeight,
    connect: connectScale,
    disconnect: disconnectScale,
    error: scaleError,
  } = useScaleConnection();

  const { data: gravimetricData, isLoading, error } = useQuery({
    queryKey: ['gravimetricData', collectionId],
    queryFn: async () => {
      console.log('[GravimetricData] Fetching data for collection:', collectionId);
      const data = await gravimetricDataService.getByCollection(collectionId);
      console.log('[GravimetricData] Received data:', data);
      return data;
    },
  });

  // Auto-fill weight field when scale sends new data
  useEffect(() => {
    if (scaleWeight !== null && isAdding && !editingId) {
      setWeightKg(String(scaleWeight));
      AccessibilityInfo.announceForAccessibility(
        `Peso da balança: ${scaleWeight} quilogramas`
      );
    }
  }, [scaleWeight, isAdding, editingId]);

  const createMutation = useMutation({
    mutationFn: gravimetricDataService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gravimetricData', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });

      setToast({ message: 'Dado gravimétrico adicionado!', type: 'success' });
      resetForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar';
      setToast({ message, type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      gravimetricDataService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gravimetricData', collectionId] });

      setToast({ message: 'Dado atualizado!', type: 'success' });
      resetForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar';
      setToast({ message, type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: gravimetricDataService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gravimetricData', collectionId] });

      setToast({ message: 'Dado removido!', type: 'success' });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao remover';
      setToast({ message, type: 'error' });
    },
  });

  const resetForm = (): void => {
    setMaterialType('');
    setWeightKg('');
    setNotes('');
    setErrors({});
    setIsAdding(false);
    setEditingId(null);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!materialType.trim()) {
      newErrors.materialType = 'Digite o tipo de material';
    }
    if (!weightKg || parseFloat(weightKg) <= 0) {
      newErrors.weightKg = 'Digite um peso válido';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      AccessibilityInfo.announceForAccessibility(`Erro: ${firstError}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;

    const data = {
      collectionId,
      materialType: materialType.trim(),
      weightKg: parseFloat(weightKg),
      notes: notes.trim() || undefined,
    };

    if (isOnline) {
      if (editingId) {
        updateMutation.mutate({ id: editingId, data });
      } else {
        createMutation.mutate(data);
      }
    } else {
      const action = editingId ? 'UPDATE' : 'CREATE';
      const offlineData = editingId ? { ...data, id: editingId } : data;

      await offlineService.addOfflineAction('gravimetricData', action, offlineData);

      setToast({
        message: 'Salvo. Será sincronizado quando estiver online.',
        type: 'success',
      });
      resetForm();
    }
  };

  const handleEdit = (item: GravimetricData): void => {
    setEditingId(item.id);
    setMaterialType(item.materialType);
    setWeightKg(String(item.weightKg));
    setNotes(item.notes || '');
    setIsAdding(true);

    AccessibilityInfo.announceForAccessibility(
      `Editando ${item.materialType}, ${item.weightKg} quilogramas`
    );
  };

  const handleDelete = (item: GravimetricData): void => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja remover ${item.materialType} (${item.weightKg}kg)?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            if (isOnline) {
              deleteMutation.mutate(item.id);
            } else {
              await offlineService.addOfflineAction('gravimetricData', 'DELETE', {
                id: item.id,
              });
              setToast({ message: 'Remoção agendada', type: 'success' });
            }
          },
        },
      ]
    );
  };

  const handleCSVImport = async (): Promise<void> => {
    const result = await pickAndParseCSV();

    if (!result) return;

    if (result.success && result.data.length > 0) {
      setCsvData(result.data);
      setShowCSVPreview(true);

      if (result.errors.length > 0) {
        AccessibilityInfo.announceForAccessibility(
          `Atenção: ${result.errors.length} linhas com erro foram ignoradas`
        );
      }
    } else {
      setToast({
        message: 'Nenhum dado válido encontrado no CSV',
        type: 'error'
      });
    }
  };

  const handleConfirmCSVImport = async (): Promise<void> => {
    let successCount = 0;

    for (const row of csvData) {
      const data = {
        collectionId,
        materialType: row.material || 'Material Importado',
        weightKg: row.weightKg,
        notes: row.timestamp ? `Importado - Data: ${row.timestamp}` : 'Importado via CSV',
      };

      try {
        if (isOnline) {
          await gravimetricDataService.create(data);
        } else {
          await offlineService.addOfflineAction('gravimetricData', 'CREATE', data);
        }
        successCount++;
      } catch (error) {
        console.error('Erro ao importar linha:', error);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['gravimetricData', collectionId] });

    setShowCSVPreview(false);
    setCsvData([]);

    setToast({
      message: `${successCount} registros importados com sucesso!`,
      type: 'success'
    });

    AccessibilityInfo.announceForAccessibility(
      `${successCount} registros importados com sucesso`
    );
  };

  const totalWeight = gravimetricData?.reduce((sum, item) => sum + toNumber(item.weightKg, 0), 0) || 0;
  console.log('[GravimetricData] Total weight calculated:', totalWeight, 'from', gravimetricData?.length, 'items');

  if (isLoading) {
    return <Loading message="Carregando dados..." />;
  }

  if (error) {
    console.error('[GravimetricData] Error loading data:', error);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Total Weight Card - Only show if there's data */}
        {gravimetricData && gravimetricData.length > 0 && (
          <Card style={styles.totalCard}>
            <View style={styles.totalContent}>
              <Ionicons name="scale" size={32} color={colors.primary[600]} />
              <View style={styles.totalText}>
                <Text style={styles.totalLabel}>Peso Total</Text>
                <Text style={styles.totalValue}>{formatNumber(totalWeight, 2)} kg</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Scale Connection Card */}
        {!isAdding && (
          <Card style={styles.scaleCard}>
            <View style={styles.scaleHeader}>
              <View style={styles.scaleInfo}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={24}
                  color={scaleConnected ? colors.success.main : colors.neutral[400]}
                />
                <Text style={styles.scaleTitle}>Balança Digital</Text>
              </View>
              <View
                style={[
                  styles.statusIndicator,
                  scaleConnected && styles.statusIndicatorConnected,
                ]}
              >
                <Text style={styles.statusText}>
                  {scaleConnected ? 'Conectada' : 'Desconectada'}
                </Text>
              </View>
            </View>

            {scaleConnected && scaleWeight !== null && (
              <View style={styles.scaleReading}>
                <Text style={styles.scaleReadingLabel}>Última Leitura:</Text>
                <Text style={styles.scaleReadingValue}>{scaleWeight} kg</Text>
              </View>
            )}

            <Button
              title={scaleConnected ? '🔌 Desconectar Balança' : '🔌 Conectar Balança'}
              variant={scaleConnected ? 'outline' : 'secondary'}
              onPress={() => (scaleConnected ? disconnectScale() : connectScale(scaleDeviceId))}
              loading={scaleConnecting}
              fullWidth
              accessibilityLabel={
                scaleConnected ? 'Desconectar balança' : 'Conectar balança'
              }
              accessibilityHint={
                scaleConnected
                  ? 'Toque duas vezes para desconectar a balança'
                  : 'Toque duas vezes para conectar à balança digital'
              }
            />

            {scaleError && (
              <Text style={styles.scaleError} accessibilityRole="alert">
                {scaleError}
              </Text>
            )}

            {scaleConnected && (
              <Text style={styles.scaleHint}>
                ⚡ Peso será preenchido automaticamente
              </Text>
            )}
          </Card>
        )}

        {/* CSV Import Button */}
        {!isAdding && (
          <Card style={styles.importCard}>
            <Button
              title="📄 Importar CSV"
              variant="outline"
              onPress={handleCSVImport}
              loading={isImportingCSV}
              fullWidth
              accessibilityLabel="Importar dados de arquivo CSV"
              accessibilityHint="Toque duas vezes para selecionar um arquivo CSV com dados de peso"
            />
            <Text style={styles.importHint}>
              Formatos aceitos: peso,material,timestamp
            </Text>
          </Card>
        )}

        {/* Form */}
        {isAdding && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId ? 'Editar Dado' : 'Novo Dado Gravimétrico'}
            </Text>

            <TextArea
              label="Tipo de Material"
              value={materialType}
              onChangeText={setMaterialType}
              placeholder="Ex: Plástico PET, Papel, Metal..."
              error={errors.materialType}
              required
              maxLength={100}
              numberOfLines={2}
              autoFocus
              accessibilityLabel="Tipo de material"
            />

            <NumericInput
              label="Peso"
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="0.00"
              error={errors.weightKg}
              required
              unit="kg"
              min={0.01}
              max={99999}
              decimals={2}
              accessibilityLabel="Peso em quilogramas"
            />

            <TextArea
              label="Observações"
              value={notes}
              onChangeText={setNotes}
              placeholder="Observações adicionais (opcional)"
              maxLength={200}
              numberOfLines={3}
              accessibilityLabel="Observações"
            />

            <View style={styles.formButtons}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={resetForm}
                accessibilityLabel="Cancelar"
              />
              <View style={styles.buttonSpacer} />
              <Button
                title={editingId ? 'Atualizar' : 'Adicionar'}
                variant="primary"
                onPress={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
                accessibilityLabel={editingId ? 'Atualizar dado' : 'Adicionar dado'}
              />
            </View>
          </Card>
        )}

        {/* List */}
        {gravimetricData && gravimetricData.length > 0 ? (
          <View>
            <Text style={styles.listTitle}>
              Dados Registrados ({gravimetricData.length})
            </Text>

            {gravimetricData.map((item) => (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemMaterial}>{item.materialType}</Text>
                  <Text style={styles.itemWeight}>{formatNumber(item.weightKg, 2)} kg</Text>
                </View>

                {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}

                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(item)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${item.materialType}`}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.primary[600]} />
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(item)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Remover ${item.materialType}`}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error.main} />
                    <Text style={[styles.actionButtonText, styles.deleteText]}>
                      Remover
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        ) : !isAdding ? (
          <EmptyState
            icon="scale-outline"
            title="Nenhum Dado Registrado"
            message="Adicione dados gravimétricos para esta coleta"
            actionLabel="Adicionar Primeiro Dado"
            onAction={() => setIsAdding(true)}
          />
        ) : null}
      </ScrollView>

      {!isAdding && gravimetricData && gravimetricData.length > 0 && (
        <FloatingActionButton
          icon="add"
          onPress={() => setIsAdding(true)}
          accessibilityLabel="Adicionar novo dado gravimétrico"
        />
      )}

      {/* CSV Preview Modal */}
      <Modal
        visible={showCSVPreview}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCSVPreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pré-visualização CSV</Text>
              <TouchableOpacity
                onPress={() => setShowCSVPreview(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
              >
                <Ionicons name="close" size={24} color={colors.neutral[700]} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {csvData.length} registros serão importados
            </Text>

            <ScrollView style={styles.modalScroll}>
              {csvData.map((row, index) => (
                <Card key={index} style={styles.previewCard}>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Material:</Text>
                    <Text style={styles.previewValue}>
                      {row.material || 'Material Importado'}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Peso:</Text>
                    <Text style={styles.previewValue}>{row.weightKg} kg</Text>
                  </View>
                  {row.timestamp && (
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Data:</Text>
                      <Text style={styles.previewValue}>{row.timestamp}</Text>
                    </View>
                  )}
                </Card>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setShowCSVPreview(false)}
                fullWidth
                accessibilityLabel="Cancelar importação"
              />
              <View style={styles.buttonSpacer} />
              <Button
                title="Importar"
                variant="primary"
                onPress={handleConfirmCSVImport}
                fullWidth
                accessibilityLabel="Confirmar importação"
              />
            </View>
          </View>
        </View>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  totalCard: {
    marginBottom: spacing.md,
  },
  totalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  totalValue: {
    ...typography.h2,
    color: colors.primary[600],
    fontWeight: '700',
  },
  formCard: {
    marginBottom: spacing.md,
  },
  formTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  buttonSpacer: {
    width: spacing.md,
  },
  listTitle: {
    ...typography.h3,
    color: colors.neutral[700],
    marginBottom: spacing.md,
  },
  itemCard: {
    marginBottom: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemMaterial: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
    flex: 1,
  },
  itemWeight: {
    ...typography.h3,
    color: colors.primary[600],
    fontWeight: '700',
  },
  itemNotes: {
    ...typography.caption,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  itemActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.primary[600],
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  deleteText: {
    color: colors.error.main,
  },
  scaleCard: {
    marginBottom: spacing.md,
  },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scaleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scaleTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  statusIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[200],
  },
  statusIndicatorConnected: {
    backgroundColor: colors.success.light,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  scaleReading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    marginBottom: spacing.md,
  },
  scaleReadingLabel: {
    ...typography.body,
    color: colors.neutral[700],
  },
  scaleReadingValue: {
    ...typography.h2,
    color: colors.primary[600],
    fontWeight: '700',
  },
  scaleError: {
    ...typography.caption,
    color: colors.error.main,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  scaleHint: {
    ...typography.caption,
    color: colors.success.dark,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  importCard: {
    marginBottom: spacing.md,
  },
  importHint: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral[50],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.neutral[600],
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  modalScroll: {
    maxHeight: 400,
    paddingHorizontal: spacing.md,
  },
  previewCard: {
    marginBottom: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  previewLabel: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  previewValue: {
    ...typography.body,
    color: colors.neutral[900],
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
});
