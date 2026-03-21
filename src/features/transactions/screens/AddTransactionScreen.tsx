import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../core/hooks/useTheme';
import { useAppSelector } from '../../../store/hooks';
import transactionService from '../../../core/services/transaction.service';
import categoryService from '../../../core/services/category.service';
import { CalculatorKeyboard } from '../components/CalculatorKeyboard';
import { CategorySelector } from '../components/CategorySelector';
import { formatCurrency } from '../../../core/utils/formatters';

interface AddTransactionScreenProps {
  navigation: any;
  route?: {
    params?: {
      type?: 'income' | 'expense';
    };
  };
}

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    route?.params?.type || 'expense'
  );
  const [amount, setAmount] = useState<string>('0');
  const [note, setNote] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    loadCategories();
  }, [transactionType]);

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getCategoriesByType(transactionType);
      setCategories(cats);
      
      // Auto-select first category if none selected
      if (cats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cats[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleNumberPress = (num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else {
      setAmount(prev => prev + num);
    }
  };

  const handleDeletePress = () => {
    if (amount.length === 1) {
      setAmount('0');
    } else {
      setAmount(prev => prev.slice(0, -1));
    }
  };

  const handleClearPress = () => {
    setAmount('0');
  };

  const handleDonePress = async () => {
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await transactionService.createTransaction({
        amount: numericAmount,
        type: transactionType,
        categoryId: selectedCategoryId,
        note: note.trim() || undefined,
        date: date.getTime(),
        isRecurring: false,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayAmount = () => {
    const num = parseFloat(amount) / 100; // Assuming amount is in cents
    return formatCurrency(num, user?.currency || 'USD');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Add Transaction
        </Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Type Selector */}
      <View style={[styles.typeSelector, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'expense' && {
              backgroundColor: colors.error + '20',
            },
          ]}
          onPress={() => setTransactionType('expense')}
        >
          <Icon
            name="arrow-down"
            size={20}
            color={transactionType === 'expense' ? colors.error : colors.text.secondary}
          />
          <Text
            style={[
              styles.typeText,
              {
                color: transactionType === 'expense'
                  ? colors.error
                  : colors.text.secondary,
              },
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'income' && {
              backgroundColor: colors.success + '20',
            },
          ]}
          onPress={() => setTransactionType('income')}
        >
          <Icon
            name="arrow-up"
            size={20}
            color={transactionType === 'income' ? colors.success : colors.text.secondary}
          />
          <Text
            style={[
              styles.typeText,
              {
                color: transactionType === 'income'
                  ? colors.success
                  : colors.text.secondary,
              },
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Display */}
        <View style={[styles.amountContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.amountLabel, { color: colors.text.secondary }]}>
            Amount
          </Text>
          <Text style={[styles.amount, { color: colors.text.primary }]}>
            {formatDisplayAmount()}
          </Text>
        </View>

        {/* Note Input */}
        <View style={[styles.noteContainer, { backgroundColor: colors.surface }]}>
          <Icon name="pencil" size={20} color={colors.text.secondary} />
          <TextInput
            style={[styles.noteInput, { color: colors.text.primary }]}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.text.secondary}
            value={note}
            onChangeText={setNote}
            maxLength={50}
          />
        </View>

        {/* Category Selector */}
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          type={transactionType}
        />

        {/* Date (will be implemented later) */}
        <TouchableOpacity
          style={[styles.dateContainer, { backgroundColor: colors.surface }]}
        >
          <Icon name="calendar" size={20} color={colors.text.secondary} />
          <Text style={[styles.dateText, { color: colors.text.primary }]}>
            {date.toLocaleDateString()}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Calculator Keyboard */}
      <CalculatorKeyboard
        onNumberPress={handleNumberPress}
        onDeletePress={handleDeletePress}
        onClearPress={handleClearPress}
        onDonePress={handleDonePress}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  amountContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
  },
});