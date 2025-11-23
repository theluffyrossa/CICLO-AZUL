import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { collectionsService } from '@/services/collections.service';
import { Collection, ApprovalStatus } from '@/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/common/Button';
import { translateWasteCategory, translateTreatmentType } from '@/utils/translations.util';

type RouteParams = {
  CollectionApproval: { collectionId: string };
};

type NavigationProp = StackNavigationProp<RouteParams>;

export const CollectionApprovalScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'CollectionApproval'>>();
  const { collectionId } = route.params;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      const data = await collectionsService.getCollectionById(collectionId);
      setCollection(data);
    } catch (error) {
      console.error('Erro ao carregar coleta:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da coleta');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    Alert.alert(
      'Confirmar Aprovação',
      'Tem certeza que deseja aprovar esta coleta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          onPress: async () => {
            try {
              setProcessing(true);
              await collectionsService.approveCollection(collectionId);
              Alert.alert('Sucesso', 'Coleta aprovada com sucesso', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Erro ao aprovar coleta:', error);
              Alert.alert('Erro', 'Não foi possível aprovar a coleta');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (rejectionReason.trim().length < 10) {
      Alert.alert('Atenção', 'O motivo da rejeição deve ter pelo menos 10 caracteres');
      return;
    }

    try {
      setProcessing(true);
      setShowRejectModal(false);
      await collectionsService.rejectCollection(collectionId, rejectionReason);
      Alert.alert('Sucesso', 'Coleta rejeitada com sucesso', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erro ao rejeitar coleta:', error);
      Alert.alert('Erro', 'Não foi possível rejeitar a coleta');
    } finally {
      setProcessing(false);
      setRejectionReason('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const statusConfig = {
      [ApprovalStatus.PENDING_APPROVAL]: {
        color: '#F59E0B',
        text: 'Pendente',
      },
      [ApprovalStatus.APPROVED]: {
        color: '#0EA5E9',
        text: 'Aprovada',
      },
      [ApprovalStatus.REJECTED]: {
        color: '#EF4444',
        text: 'Rejeitada',
      },
    };

    const config = statusConfig[status];
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
        <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Carregando dados da coleta...</Text>
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Coleta não encontrada</Text>
      </View>
    );
  }

  const isPending = collection.approvalStatus === ApprovalStatus.PENDING_APPROVAL;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Detalhes da Coleta</Text>
          {getStatusBadge(collection.approvalStatus)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Cliente</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{collection.client?.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Unidade:</Text>
            <Text style={styles.value}>{collection.unit?.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>{collection.unit?.address || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da Coleta</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Data da Coleta:</Text>
            <Text style={styles.value}>{formatDate(collection.collectionDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tipo de Resíduo:</Text>
            <Text style={styles.value}>{collection.wasteType?.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Categoria:</Text>
            <Text style={styles.value}>
              {collection.wasteType?.category ? translateWasteCategory(collection.wasteType.category) : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Peso Total:</Text>
            <Text style={styles.value}>
              {collection.gravimetricData?.[0]?.weightKg != null
                ? `${Number(collection.gravimetricData[0].weightKg).toFixed(2)} kg`
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tipo de Tratamento:</Text>
            <Text style={styles.value}>{translateTreatmentType(collection.treatmentType)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Destinatário:</Text>
            <Text style={styles.value}>{collection.recipient?.name || 'N/A'}</Text>
          </View>
        </View>

        {collection.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.notes}>{collection.notes}</Text>
          </View>
        )}

        {collection.latitude != null && collection.longitude != null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localização</Text>
            <Text style={styles.value}>
              Lat: {Number(collection.latitude).toFixed(6)}, Lng: {Number(collection.longitude).toFixed(6)}
            </Text>
          </View>
        )}

        {collection.images && collection.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos ({collection.images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {collection.images.map((image, index) => (
                <Image
                  key={image.id}
                  source={{ uri: image.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {collection.rejectionReason && (
          <View style={[styles.section, styles.rejectionSection]}>
            <Text style={styles.sectionTitle}>Motivo da Rejeição</Text>
            <Text style={styles.rejectionReason}>{collection.rejectionReason}</Text>
          </View>
        )}

        {collection.approvedAt && collection.approver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações de Aprovação</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Aprovado por:</Text>
              <Text style={styles.value}>{collection.approver.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Data de Aprovação:</Text>
              <Text style={styles.value}>{formatDate(collection.approvedAt)}</Text>
            </View>
          </View>
        )}

        {isPending && (
          <View style={styles.actionsContainer}>
            <Button
              title="Aprovar Coleta"
              onPress={handleApprove}
              disabled={processing}
              loading={processing}
              variant="primary"
              size="lg"
              fullWidth
              accessibilityLabel="Aprovar coleta"
              accessibilityHint="Toca para aprovar esta coleta e incluí-la no dashboard"
            />
            <Button
              title="Rejeitar Coleta"
              onPress={() => setShowRejectModal(true)}
              disabled={processing}
              variant="danger"
              size="lg"
              fullWidth
              accessibilityLabel="Rejeitar coleta"
              accessibilityHint="Toca para rejeitar esta coleta e informar o motivo"
            />
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showRejectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Rejeitar Coleta</Text>
                <Text style={styles.modalSubtitle}>
                  Informe o motivo da rejeição (mínimo 10 caracteres):
                </Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Ex: Peso informado não corresponde às imagens..."
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                <Text style={styles.charCount}>
                  {rejectionReason.length}/500 caracteres
                </Text>
                <View style={styles.modalActions}>
                  <Button
                    title="Cancelar"
                    onPress={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                    }}
                    variant="outline"
                    size="md"
                    fullWidth
                    accessibilityLabel="Cancelar rejeição"
                    accessibilityHint="Toca para cancelar e voltar"
                  />
                  <Button
                    title="Confirmar Rejeição"
                    onPress={handleReject}
                    disabled={rejectionReason.trim().length < 10}
                    variant="danger"
                    size="md"
                    fullWidth
                    accessibilityLabel="Confirmar rejeição da coleta"
                    accessibilityHint="Toca para confirmar a rejeição com o motivo informado"
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    color: '#475569',
    fontSize: 14,
    marginTop: spacing.md,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  infoRow: {
    marginBottom: spacing.sm,
  },
  label: {
    color: '#475569',
    fontSize: 12,
  },
  value: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  notes: {
    color: '#0F172A',
    fontSize: 14,
    fontStyle: 'italic',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  rejectionSection: {
    backgroundColor: '#FCA5A5' + '10',
    borderWidth: 1,
    borderColor: '#FCA5A5' + '30',
  },
  rejectionReason: {
    color: '#EF4444',
    fontSize: 14,
  },
  actionsContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    color: '#475569',
    fontSize: 14,
    marginBottom: spacing.md,
  },
  textArea: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: spacing.sm,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: colors.background.default,
    color: '#0F172A',
  },
  charCount: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'column',
    gap: spacing.md,
  },
});
