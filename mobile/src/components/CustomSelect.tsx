import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SelectOption {
  label: string;
  value: string;
  emoji?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const COLORS = {
  background: '#f5f5f5',
  surface: '#ffffff',
  primary: '#2B87F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#ddd',
  error: '#f44336',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  error = false,
  disabled = false,
  accessibilityLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (selectedValue: string): void => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            backgroundColor: COLORS.surface,
            borderColor: error ? COLORS.error : COLORS.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <View style={styles.selectedContent}>
          {selectedOption?.icon ? (
            <Ionicons
              name={selectedOption.icon}
              size={20}
              color={selectedOption.iconColor || COLORS.primary}
            />
          ) : selectedOption?.emoji ? (
            <Text style={styles.selectedEmoji}>{selectedOption.emoji}</Text>
          ) : null}
          <Text
            style={[
              styles.selectedText,
              {
                color: selectedOption ? COLORS.text : COLORS.textSecondary,
              },
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione uma opção</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} accessibilityRole="button">
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: item.value === value ? COLORS.primary : COLORS.surface,
                    },
                  ]}
                  onPress={() => handleSelect(item.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.value === value }}
                >
                  <View style={styles.optionContent}>
                    {item.icon ? (
                      <Ionicons
                        name={item.icon}
                        size={22}
                        color={item.value === value ? COLORS.surface : (item.iconColor || COLORS.primary)}
                      />
                    ) : item.emoji ? (
                      <Text style={styles.optionEmoji}>{item.emoji}</Text>
                    ) : null}
                    <Text
                      style={[
                        styles.optionText,
                        { color: item.value === value ? COLORS.surface : COLORS.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color={COLORS.surface} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={styles.optionsList}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectButton: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectedEmoji: {
    fontSize: 20,
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});
