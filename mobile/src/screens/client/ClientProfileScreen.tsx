import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { usePendingActions } from '@/store/offlineStore';
import { colors, spacing, typography, shadows, borderRadius } from '@/theme';

export const ClientProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const pendingActions = usePendingActions();

  const handleLogout = (): void => {
    if (pendingActions.length > 0) {
      Alert.alert(
        'Ações Pendentes',
        `Você tem ${pendingActions.length} ${
          pendingActions.length === 1 ? 'ação pendente' : 'ações pendentes'
        } de sincronização. Deseja sair mesmo assim?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              await logout();
              AccessibilityInfo.announceForAccessibility('Logout realizado');
            },
          },
        ]
      );
    } else {
      Alert.alert('Confirmar Logout', 'Deseja realmente sair?', [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            AccessibilityInfo.announceForAccessibility('Logout realizado');
          },
        },
      ]);
    }
  };

  if (!user) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessible={true}
      accessibilityLabel="Perfil do cliente"
    >
      <Card style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="business" size={48} color={colors.neutral[50]} />
          </View>
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Cliente</Text>
        </View>
      </Card>

      <Card style={styles.menuCard}>
        <MenuOption
          icon="person-outline"
          label="Meus Dados"
          onPress={() => navigation.navigate('EditProfile' as never)}
          accessibilityLabel="Ver informações do perfil"
          accessibilityHint="Toque duas vezes para visualizar detalhes da conta"
        />

        <MenuOption
          icon="accessibility-outline"
          label="Acessibilidade"
          onPress={() => navigation.navigate('AccessibilitySettings' as never)}
          accessibilityLabel="Acessibilidade"
          accessibilityHint="Toque duas vezes para ajustar o tamanho da fonte"
        />

        <MenuOption
          icon="help-circle-outline"
          label="Ajuda"
          onPress={() => {}}
          accessibilityLabel="Ajuda e suporte"
          accessibilityHint="Toque duas vezes para acessar a ajuda"
        />

        <MenuOption
          icon="information-circle-outline"
          label="Sobre"
          onPress={() => {}}
          accessibilityLabel="Sobre o aplicativo"
          accessibilityHint="Toque duas vezes para ver informações do app"
        />
      </Card>

      {pendingActions.length > 0 && (
        <Card style={styles.syncCard}>
          <View style={styles.syncHeader}>
            <Ionicons name="cloud-upload-outline" size={24} color={colors.warning.main} />
            <Text style={styles.syncTitle}>Sincronização Pendente</Text>
          </View>
          <Text style={styles.syncText}>
            {pendingActions.length} {pendingActions.length === 1 ? 'item' : 'itens'} aguardando
            sincronização
          </Text>
        </Card>
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
        accessibilityHint="Toque duas vezes para fazer logout"
      >
        <Ionicons name="log-out-outline" size={24} color={colors.error.main} />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Versão 1.0.0</Text>
    </ScrollView>
  );
};

interface MenuOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

const MenuOption: React.FC<MenuOptionProps> = ({
  icon,
  label,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}) => (
  <TouchableOpacity
    style={styles.menuOption}
    onPress={onPress}
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
  >
    <View style={styles.menuOptionLeft}>
      <Ionicons name={icon} size={24} color={colors.neutral[700]} />
      <Text style={styles.menuOptionText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    padding: spacing['4'],
  },
  userCard: {
    alignItems: 'center',
    marginBottom: spacing['5'],
    padding: spacing['6'],
  },
  avatarContainer: {
    marginBottom: spacing['4'],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing['1'],
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: spacing['4'],
  },
  roleBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  roleText: {
    fontSize: 12,
    color: colors.primary[700],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    marginBottom: spacing['5'],
    padding: 0,
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginLeft: spacing['3'],
  },
  syncCard: {
    marginBottom: spacing['5'],
    backgroundColor: colors.warning.light + '15',
    borderColor: colors.warning.main,
    borderWidth: 1.5,
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2'],
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing['2'],
  },
  syncText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error.light + '15',
    padding: spacing['4'],
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.error.main,
    marginBottom: spacing['6'],
  },
  logoutText: {
    fontSize: 16,
    color: colors.error.main,
    fontWeight: '600',
    marginLeft: spacing['2'],
  },
  version: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing['10'],
  },
});
