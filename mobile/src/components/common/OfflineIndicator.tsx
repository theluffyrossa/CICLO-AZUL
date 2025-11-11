import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsOnline, usePendingActions, useIsSyncing } from '@/store/offlineStore';
import { offlineService } from '@/services/offline.service';
import { colors, spacing, typography, shadows } from '@/theme';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useIsOnline();
  const pendingActions = usePendingActions();
  const isSyncing = useIsSyncing();

  const handleSync = async (): Promise<void> => {
    if (!isOnline || isSyncing) return;

    AccessibilityInfo.announceForAccessibility('Iniciando sincronização');
    const result = await offlineService.syncPendingActions();

    if (result.failed > 0) {
      AccessibilityInfo.announceForAccessibility(
        `Sincronização concluída com ${result.failed} erros`
      );
    } else {
      AccessibilityInfo.announceForAccessibility('Sincronização concluída com sucesso');
    }
  };

  if (isOnline && pendingActions.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        !isOnline && styles.containerOffline,
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={
        !isOnline
          ? 'Dispositivo offline'
          : `${pendingActions.length} ${pendingActions.length === 1 ? 'item pendente' : 'itens pendentes'} de sincronização`
      }
    >
      <View style={styles.content}>
        <Ionicons
          name={!isOnline ? 'cloud-offline' : isSyncing ? 'sync' : 'cloud-upload-outline'}
          size={20}
          color={colors.neutral[50]}
          style={isSyncing && styles.syncIcon}
        />
        <Text style={styles.text}>
          {!isOnline
            ? 'Offline'
            : isSyncing
            ? 'Sincronizando...'
            : `${pendingActions.length} ${pendingActions.length === 1 ? 'item pendente' : 'itens pendentes'}`}
        </Text>
      </View>

      {isOnline && !isSyncing && pendingActions.length > 0 && (
        <TouchableOpacity
          onPress={handleSync}
          style={styles.syncButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Sincronizar agora"
          accessibilityHint="Toque duas vezes para sincronizar dados pendentes"
        >
          <Text style={styles.syncButtonText}>Sincronizar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warning.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
    elevation: 4,
  },
  containerOffline: {
    backgroundColor: colors.error.main,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    ...typography.body,
    color: colors.neutral[50],
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  syncButtonText: {
    ...typography.caption,
    color: colors.neutral[50],
    fontWeight: '700',
  },
  syncIcon: {
    transform: [{ rotate: '360deg' }],
  },
});
