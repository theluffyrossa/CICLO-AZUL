import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRoute, RouteProp } from '@react-navigation/native';
import { clientService } from '../../services/client.service';
import { CollectionStatus, ApprovalStatus } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import { getFontSizeMultiplier } from '../../theme/dynamicStyles';
import { getImageUrl } from '../../utils/image.util';
import { cleanWasteTypeName, translateTreatmentType } from '../../utils/translations.util';
import { ImageCard } from '@/components/collections/ImageCard';

type RouteParams = {
  ClientCollectionDetail: {
    collectionId: string;
  };
};

export const ClientCollectionDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'ClientCollectionDetail'>>();
  const { collectionId } = route.params;
  const { fontSize } = useSettingsStore();
  const fontMultiplier = getFontSizeMultiplier(fontSize);

  const { data: collection, isLoading, error } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => clientService.getCollectionById(collectionId),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color="#2B87F5" />
        <Text style={[styles.loadingText, { fontSize: 16 * fontMultiplier }]}>
          Carregando detalhes...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !collection) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['bottom']}>
        <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
        <Text style={[styles.errorText, { fontSize: 16 * fontMultiplier }]}>
          Erro ao carregar detalhes da pesagem
        </Text>
      </SafeAreaView>
    );
  }

  const totalWeight = collection.gravimetricData?.reduce(
    (sum, gd) => sum + Number(gd.weightKg),
    0
  ) || 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView accessible={true} accessibilityLabel="Detalhes da pesagem">
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={[styles.wasteTypeName, { fontSize: 16 * fontMultiplier * 1.3 }]}>
          {cleanWasteTypeName(collection.wasteType?.name)}
        </Text>
        <View style={[styles.statusBadge, getStatusStyle(collection.status)]}>
          <Text style={[styles.statusText, { fontSize: 16 * fontMultiplier }]}>
            {getStatusLabel(collection.status)}
          </Text>
        </View>
      </View>

      {/* Collection Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: 16 * fontMultiplier * 1.1 }]}>
          Informações da Pesagem
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#2B87F5" />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { fontSize: 16 * fontMultiplier * 0.9 }]}>
              Data da Pesagem
            </Text>
            <Text style={[styles.infoValue, { fontSize: 16 * fontMultiplier }]}>
              {formatDate(collection.collectionDate)}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#2B87F5" />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { fontSize: 16 * fontMultiplier * 0.9 }]}>
              Local de Pesagem
            </Text>
            <Text style={[styles.infoValue, { fontSize: 16 * fontMultiplier }]}>
              {collection.unit?.name}
            </Text>
            {collection.unit?.address && (
              <Text style={[styles.infoSecondary, { fontSize: 16 * fontMultiplier * 0.85 }]}>
                {collection.unit.address}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#2B87F5" />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { fontSize: 16 * fontMultiplier * 0.9 }]}>
              Operador Responsável
            </Text>
            <Text style={[styles.infoValue, { fontSize: 16 * fontMultiplier }]}>
              {collection.user?.name}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={20} color="#2B87F5" />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { fontSize: 16 * fontMultiplier * 0.9 }]}>
              Destinatário
            </Text>
            <Text style={[styles.infoValue, { fontSize: 16 * fontMultiplier }]}>
              {collection.recipient?.name}
            </Text>
            <Text style={[styles.infoSecondary, { fontSize: 16 * fontMultiplier * 0.85 }]}>
              {collection.recipient?.type}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="sync-outline" size={20} color="#2B87F5" />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { fontSize: 16 * fontMultiplier * 0.9 }]}>
              Tipo de Tratamento
            </Text>
            <Text style={[styles.infoValue, { fontSize: 16 * fontMultiplier }]}>
              {translateTreatmentType(collection.treatmentType)}
            </Text>
          </View>
        </View>
      </View>

      {/* Approval Status */}
      {collection.approvalStatus && collection.approvalStatus !== ApprovalStatus.PENDING_APPROVAL && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 16 * fontMultiplier * 1.1 }]}>
            Status de Aprovação
          </Text>

          <View style={styles.infoRow}>
            <Ionicons
              name={collection.approvalStatus === ApprovalStatus.APPROVED ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={collection.approvalStatus === ApprovalStatus.APPROVED ? '#2B87F5' : '#f44336'}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { fontSize: 16 * fontMultiplier * 0.9 }]}>
                Status
              </Text>
              <Text style={[
                styles.infoValue,
                { fontSize: 16 * fontMultiplier },
                collection.approvalStatus === ApprovalStatus.APPROVED ? styles.approvedText : styles.rejectedText
              ]}>
                {collection.approvalStatus === ApprovalStatus.APPROVED ? 'Aprovada' : 'Rejeitada'}
              </Text>
            </View>
          </View>

          {collection.approver && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { fontSize: 16 * fontMultiplier * 0.9 }]}>
                  {collection.approvalStatus === ApprovalStatus.APPROVED ? 'Aprovado por' : 'Rejeitado por'}
                </Text>
                <Text style={[styles.infoValue, { fontSize: 16 * fontMultiplier }]}>
                  {collection.approver.name}
                </Text>
              </View>
            </View>
          )}

          {collection.approvedAt && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { fontSize: 16 * fontMultiplier * 0.9 }]}>
                  Data
                </Text>
                <Text style={[styles.infoValue, { fontSize: 16 * fontMultiplier }]}>
                  {formatDate(collection.approvedAt)}
                </Text>
              </View>
            </View>
          )}

          {collection.approvalStatus === ApprovalStatus.REJECTED && collection.rejectionReason && (
            <View style={styles.rejectionReasonContainer}>
              <View style={styles.rejectionHeader}>
                <Ionicons name="alert-circle" size={20} color="#f44336" />
                <Text style={[styles.rejectionTitle, { fontSize: 16 * fontMultiplier * 0.9 }]}>
                  Motivo da Rejeição
                </Text>
              </View>
              <Text style={[styles.rejectionReasonText, { fontSize: 16 * fontMultiplier }]}>
                {collection.rejectionReason}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Weight Data */}
      {collection.gravimetricData && collection.gravimetricData.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 16 * fontMultiplier * 1.1 }]}>
            Dados Gravimétricos
          </Text>

          <View style={styles.weightCard}>
            <Ionicons name="scale-outline" size={32} color="#2B87F5" />
            <Text style={[styles.weightValue, { fontSize: 16 * fontMultiplier * 2 }]}>
              {totalWeight.toFixed(1)}
            </Text>
            <Text style={[styles.weightLabel, { fontSize: 16 * fontMultiplier }]}>
              kg pesados
            </Text>
          </View>

          {collection.gravimetricData.map((gd, index) => (
            <View key={gd.id} style={styles.gravimetricItem}>
              <View style={styles.gravimetricHeader}>
                <Text style={[styles.gravimetricLabel, { fontSize: 16 * fontMultiplier * 0.9 }]}>
                  Medição {index + 1}
                </Text>
                <Text style={[styles.gravimetricWeight, { fontSize: 16 * fontMultiplier }]}>
                  {Number(gd.weightKg).toFixed(2)} kg
                </Text>
              </View>
              <Text style={[styles.gravimetricSource, { fontSize: 16 * fontMultiplier * 0.85 }]}>
                Fonte: {gd.source}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Images */}
      {collection.images && collection.images.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 16 * fontMultiplier * 1.1 }]}>
            Fotos da Pesagem ({collection.images.length})
          </Text>

          <View style={styles.imagesGrid}>
            {collection.images.map((img) => (
              <ImageCard
                key={img.id}
                imageUrl={getImageUrl(img.url)}
                consentGiven={img.consentGiven}
                accessibilityLabel={`Foto da pesagem, ${img.description || 'sem descrição'}`}
              />
            ))}
          </View>
        </View>
      )}

      {/* Notes */}
      {collection.notes && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 16 * fontMultiplier * 1.1 }]}>
            Observações
          </Text>
          <Text style={[styles.notesText, { fontSize: 16 * fontMultiplier }]}>
            {collection.notes}
          </Text>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusLabel = (status: CollectionStatus): string => {
  const labels: Record<CollectionStatus, string> = {
    SCHEDULED: 'Agendada',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
  };
  return labels[status] || status;
};

const getStatusStyle = (status: CollectionStatus) => {
  const styles: Record<CollectionStatus, object> = {
    SCHEDULED: { backgroundColor: '#FFF3E0' },
    IN_PROGRESS: { backgroundColor: '#E3F2FD' },
    COMPLETED: { backgroundColor: '#E0F2FE' },
    CANCELLED: { backgroundColor: '#FFEBEE' },
  };
  return styles[status] || { backgroundColor: '#f5f5f5' };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: '#2B87F5',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wasteTypeName: {
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    color: '#333',
    fontWeight: '600',
  },
  infoSecondary: {
    color: '#666',
    marginTop: 2,
  },
  weightCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
  },
  weightValue: {
    fontWeight: 'bold',
    color: '#2B87F5',
    marginTop: 8,
  },
  weightLabel: {
    color: '#666',
    marginTop: 4,
  },
  gravimetricItem: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 12,
  },
  gravimetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gravimetricLabel: {
    color: '#666',
  },
  gravimetricWeight: {
    fontWeight: '600',
    color: '#2B87F5',
  },
  gravimetricSource: {
    color: '#999',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  consentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  notesText: {
    color: '#666',
    lineHeight: 24,
  },
  approvedText: {
    color: '#2B87F5',
  },
  rejectedText: {
    color: '#f44336',
  },
  rejectionReasonContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rejectionTitle: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#f44336',
  },
  rejectionReasonText: {
    color: '#333',
    lineHeight: 22,
    marginLeft: 28,
  },
});
