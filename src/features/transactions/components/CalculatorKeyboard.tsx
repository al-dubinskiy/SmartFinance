import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../core/hooks/useTheme';

const { width } = Dimensions.get('window');
const KEY_SIZE = width / 4 - 16;

interface CalculatorKeyboardProps {
  onNumberPress: (num: string) => void;
  onDeletePress: () => void;
  onClearPress: () => void;
  onDonePress: () => void;
  disabled?: boolean;
}

export const CalculatorKeyboard: React.FC<CalculatorKeyboardProps> = ({
  onNumberPress,
  onDeletePress,
  onClearPress,
  onDonePress,
  disabled = false,
}) => {
  const { colors } = useTheme();

  const keys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['00', '0', 'delete'],
  ];

  const renderKey = (key: string, index: number) => {
    if (key === 'delete') {
      return (
        <TouchableOpacity
          key={`key-${index}`}
          style={[styles.key, { backgroundColor: colors.surface }]}
          onPress={onDeletePress}
          disabled={disabled}
        >
          <Icon name="backspace-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      );
    }

    if (key === '00') {
      return (
        <TouchableOpacity
          key={`key-${index}`}
          style={[styles.key, { backgroundColor: colors.surface }]}
          onPress={() => onNumberPress('00')}
          disabled={disabled}
        >
          <Text style={[styles.keyText, { color: colors.text.primary }]}>00</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={`key-${index}`}
        style={[styles.key, { backgroundColor: colors.surface }]}
        onPress={() => onNumberPress(key)}
        disabled={disabled}
      >
        <Text style={[styles.keyText, { color: colors.text.primary }]}>{key}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((key, keyIndex) => renderKey(key, rowIndex * 4 + keyIndex))}
        </View>
      ))}
      
      {/* Done button */}
      <TouchableOpacity
        style={[styles.doneButton, { backgroundColor: colors.primary }]}
        onPress={onDonePress}
        disabled={disabled}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
  },
  doneButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});