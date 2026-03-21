import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme } from '../../../core/hooks/useTheme';
import { formatCurrency, formatDate } from '../../../core/utils/formatters';
import { Transaction } from '../../../database/models/Transaction';

interface TransactionItemProps {
  transaction: Transaction & { category?: any };
  onPress: () => void;
  onDelete: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onDelete,
}) => {
  const { colors } = useTheme();
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: colors.error }]}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}
      >
        <Icon name="delete" size={24} color="#FFFFFF" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const amountColor = transaction.type === 'income' ? colors.success : colors.error;
  const amountPrefix = transaction.type === 'income' ? '+' : '-';

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.surface }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: transaction.category?.color + '20' },
          ]}
        >
          <Icon
            name={transaction.category?.icon || 'help'}
            size={24}
            color={transaction.category?.color || colors.text.secondary}
          />
        </View>

        <View style={styles.details}>
          <Text style={[styles.category, { color: colors.text.primary }]}>
            {transaction.category?.name || 'Unknown'}
          </Text>
          {transaction.note ? (
            <Text style={[styles.note, { color: colors.text.secondary }]} numberOfLines={1}>
              {transaction.note}
            </Text>
          ) : null}
          <Text style={[styles.date, { color: colors.text.secondary }]}>
            {formatDate(transaction.date)}
          </Text>
        </View>

        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}{formatCurrency(transaction.amount)}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  note: {
    fontSize: 12,
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderRadius: 12,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
});