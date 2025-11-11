import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { usePendingActions } from '@/store/offlineStore';
import { colors, spacing, typography, standardStyles } from '@/theme';

export const ProfileScreen: React.FC = () => {
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

  const getRoleLabel = (role: string): string => {
    return role === 'ADMIN' ? 'Administrador' : 'Operador';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessible={true}
      accessibilityLabel="Perfil do usuário"
    >
      {/* User Info Card */}
      <Card style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={colors.neutral[50]} />
          </View>
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
        </View>
      </Card>

      {/* Menu Options */}
      <Card style={styles.menuCard}>
        <MenuOption
          icon="create-outline"
          label="Editar Perfil"
          onPress={() => navigation.navigate('EditProfile' as never)}
          accessibilityLabel="Editar perfil"
          accessibilityHint="Toque duas vezes para editar suas informações"
        />

        <MenuOption
          icon="lock-closed-outline"
          label="Trocar PIN"
          onPress={() => navigation.navigate('ChangePin' as never)}
          accessibilityLabel="Trocar PIN"
          accessibilityHint="Toque duas vezes para alterar seu PIN de acesso"
        />

        <MenuOption
          icon="eye-outline"
          label="Acessibilidade"
          onPress={() => navigation.navigate('AccessibilitySettings' as never)}
          accessibilityLabel="Acessibilidade"
          accessibilityHint="Toque duas vezes para ajustar o tamanho da fonte"
        />
      </Card>

      {/* Sync Info */}
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

      {/* Logout Button */}
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
    backgroundColor: colors.neutral[100],
  },
  content: {
    padding: spacing.md,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    ...standardStyles.sectionTitle,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...standardStyles.fieldValue,
    marginBottom: spacing.md,
  },
  roleBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  roleText: {
    ...standardStyles.secondaryText,
    color: colors.primary[700],
    fontWeight: '600',
  },
  menuCard: {
    marginBottom: spacing.md,
    padding: 0,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  menuOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuOptionText: {
    ...standardStyles.fieldValue,
    fontWeight: '500',
    marginLeft: spacing.md,
  },
  syncCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.warning[50],
    borderColor: colors.warning.main,
    borderWidth: 1,
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  syncTitle: {
    ...standardStyles.fieldValue,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  syncText: {
    ...standardStyles.secondaryText,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error.main,
    marginBottom: spacing.lg,
  },
  logoutText: {
    ...standardStyles.fieldValue,
    color: colors.error.main,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  version: {
    ...standardStyles.secondaryText,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
