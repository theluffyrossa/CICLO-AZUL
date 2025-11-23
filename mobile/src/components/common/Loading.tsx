import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing } from '@/theme';

interface LoadingProps {
  message?: string;
  showLogo?: boolean;
}

export const Loading = ({ message, showLogo = false }: LoadingProps): React.ReactElement => {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Carregando'}
      accessibilityLiveRegion="polite"
    >
      {showLogo ? (
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          {message && <Text style={styles.message}>{message}</Text>}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    padding: spacing.xl,
  },
  logo: {
    width: 200,
    height: 200,
  },
  message: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary,
  },
});
