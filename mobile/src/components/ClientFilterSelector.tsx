import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing } from '@/theme';
import { Select } from './forms/Select';
import { Client } from '@/types';

interface ClientFilterSelectorProps {
  clients: Client[];
  selectedClientId: string | null;
  onClientChange: (clientId: string | null) => void;
  loading?: boolean;
}

export const ClientFilterSelector: React.FC<ClientFilterSelectorProps> = ({
  clients,
  selectedClientId,
  onClientChange,
  loading = false,
}) => {
  const clientOptions = [
    { label: 'Todos os clientes', value: '' },
    ...clients.map((client) => ({
      label: `${client.name} - ${client.document}`,
      value: client.id,
    })),
  ];

  const handleChange = (value: string | number): void => {
    const stringValue = String(value);
    const clientId = stringValue === '' ? null : stringValue;
    onClientChange(clientId);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Carregando clientes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Select
        label="Cliente"
        options={clientOptions}
        value={selectedClientId || ''}
        onValueChange={handleChange}
        placeholder="Selecione um cliente"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['4'],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    backgroundColor: colors.background.default,
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: spacing['2'],
    fontSize: 14,
    color: colors.text.secondary,
  },
});
