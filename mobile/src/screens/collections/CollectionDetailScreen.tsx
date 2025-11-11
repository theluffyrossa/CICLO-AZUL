import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  AccessibilityInfo,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, Loading, EmptyState, ImagePreview } from '@/components/common';
import { collectionsService } from '@/services/collections.service';
import { gravimetricDataService } from '@/services/gravimetricData.service';
import { imagesService } from '@/services/images.service';
import { CollectionStatus } from '@/types';
import { colors, spacing, typography, standardStyles } from '@/theme';
import { toNumber, formatNumber } from '@/utils/numbers';

type RouteParams = {
  CollectionDetail: {
    collectionId: number;
  };
};

const STATUS_CONFIG = {
  [CollectionStatus.SCHEDULED]: {
    label: 'Agendada',
    color: colors.info.main,
    icon: 'calendar-outline' as const,
  },
  [CollectionStatus.IN_PROGRESS]: {
    label: 'Em Andamento',
    color: colors.warning.main,
    icon: 'time-outline' as const,
  },
  [CollectionStatus.COMPLETED]: {
    label: 'Concluída',
    color: colors.success.main,
    icon: 'checkmark-circle-outline' as const,
  },
  [CollectionStatus.CANCELLED]: {
    label: 'Cancelada',
    color: colors.error.main,
    icon: 'close-circle-outline' as const,
  },
};

export const CollectionDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'CollectionDetail'>>();
  const navigation = useNavigation();
  const { collectionId } = route.params;

  const { data: collection, isLoading } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => collectionsService.getCollectionById(String(collectionId)),
  });

  const { data: gravimetricData } = useQuery({
    queryKey: ['gravimetricData', collectionId],
    queryFn: () => gravimetricDataService.getByCollection(collectionId),
    enabled: !!collection,
  });

  const { data: images } = useQuery({
    queryKey: ['images', collectionId],
    queryFn: () => imagesService.getImagesByCollection(collectionId),
    enabled: !!collection,
  });

  useEffect(() => {
    if (collection) {
      const statusLabel = STATUS_CONFIG[collection.status].label;
      AccessibilityInfo.announceForAccessibility(
        `Detalhes da coleta. Cliente: ${collection.client?.name}. Status: ${statusLabel}`
      );
    }
  }, [collection]);

  if (isLoading) {
    return <Loading message="Carregando detalhes..." />;
  }

  if (!collection) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Coleta não encontrada"
        message="Não foi possível carregar os detalhes desta coleta."
        actionLabel="Voltar"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const statusConfig = STATUS_CONFIG[collection.status];
  const totalWeight = gravimetricData?.reduce((sum, data) => sum + toNumber(data.weightKg, 0), 0) || 0;
  const formattedDate = format(
    new Date(collection.collectionDate),
    "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
    { locale: ptBR }
  );

  return (
    <ScrollView
      style={styles.container}
      accessible={true}
      accessibilityLabel="Detalhes da coleta"
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
        <Ionicons name={statusConfig.icon} size={24} color={colors.neutral[50]} />
        <Text style={styles.statusText}>{statusConfig.label}</Text>
      </View>

      {/* Informações Principais */}
      <Card style={styles.card}>
        <InfoRow icon="business" label="Cliente" value={collection.client?.name || '-'} />
        <InfoRow icon="location" label="Unidade" value={collection.unit?.name || '-'} />
        <InfoRow icon="trash" label="Tipo de Resíduo" value={collection.wasteType?.name || '-'} />
        <InfoRow icon="calendar" label="Data/Hora" value={formattedDate} />
        <InfoRow icon="person" label="Operador" value={collection.user?.name || '-'} />
        <InfoRow icon="scale" label="Peso Total" value={`${formatNumber(totalWeight, 2)} kg`} />
      </Card>

      {/* Observações */}
      {collection.notes && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.notes}>{collection.notes}</Text>
        </Card>
      )}

      {/* Dados Gravimétricos */}
      {gravimetricData && gravimetricData.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Dados Gravimétricos</Text>
          {gravimetricData.map((data) => (
            <View key={data.id} style={styles.gravimetricItem}>
              <Text style={styles.materialType}>{data.materialType}</Text>
              <Text style={styles.weight}>{formatNumber(data.weightKg, 2)} kg</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Imagens */}
      {images && images.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Fotos ({images.length})</Text>
          <View style={styles.imagesGrid}>
            {images.map((image) => (
              <ImagePreview
                key={image.id}
                uri={image.url}
                accessibilityLabel={`Foto da coleta ${collection.id}`}
              />
            ))}
          </View>
        </Card>
      )}

      {/* Botões de Ação */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('GravimetricData' as never, { collectionId } as never)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Adicionar dados gravimétricos"
      >
        <Ionicons name="scale-outline" size={24} color={colors.primary[600]} />
        <Text style={styles.actionButtonText}>Adicionar Dados Gravimétricos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('Camera' as never, { collectionId } as never)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Tirar foto"
      >
        <Ionicons name="camera-outline" size={24} color={colors.primary[600]} />
        <Text style={styles.actionButtonText}>Tirar Foto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color={colors.neutral[600]} style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  statusText: {
    ...typography.h3,
    color: colors.neutral[50],
    marginLeft: spacing.sm,
  },
  card: {
    margin: spacing.md,
    marginTop: 0,
  },
  sectionTitle: {
    ...standardStyles.sectionTitle,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  infoIcon: {
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...standardStyles.fieldLabel,
  },
  infoValue: {
    ...standardStyles.fieldValue,
    marginTop: spacing.sm,
  },
  notes: {
    ...standardStyles.fieldValue,
    lineHeight: 22,
  },
  gravimetricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  materialType: {
    ...standardStyles.fieldValue,
  },
  weight: {
    ...standardStyles.fieldValue,
    color: colors.primary[600],
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[600],
  },
  actionButtonText: {
    ...standardStyles.buttonText,
    marginLeft: spacing.sm,
  },
});
