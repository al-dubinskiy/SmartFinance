import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabScreenProps } from '../../../navigation/types';
import { useTheme } from '../../../core/hooks/useTheme';
import { useAppSelector } from '../../../store/hooks';
import transactionService from '../../../core/services/transaction.service';
import categoryService from '../../../core/services/category.service';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionItem } from '../components/TransactionItem';
import { formatMonthYear } from '../../../core/utils/formatters';

interface Stats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const HomeScreen: React.FC<MainTabScreenProps<'Home'>> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const now = currentMonth;
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

      // Get statistics
      const statistics = await transactionService.getStatistics(startOfMonth, endOfMonth);
      
      setStats({
        totalIncome: statistics.totalIncome,
        totalExpense: statistics.totalExpense,
        balance: statistics.balance,
      });

      // Get recent transactions
      const recent = await transactionService.getRecentTransactions(20);
      
      // Load category details for each transaction
      const categories = await categoryService.getAllCategories();
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      
      const transactionsWithCategories = recent.map(t => ({
        ...t,
        category: categoryMap.get(t.categoryId),
      }));
      
      setTransactions(transactionsWithCategories);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleTransactionPress = (transaction: any) => {
    // TODO: Navigate to transaction details/edit
    console.log('Transaction pressed:', transaction.id);
  };

  const handleTransactionDelete = (transaction: any) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.deleteTransaction(transaction.id);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    // Don't allow future months
    if (newDate > new Date()) return;
    
    setCurrentMonth(newDate);
    setIsLoading(true);
  };

  const handleAddTransaction = (type: 'income' | 'expense') => {
    navigation.getParent()?.navigate('AddTransactionModal', { type });
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <BalanceCard
          balance={0}
          income={0}
          expense={0}
          isLoading={true}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header with month selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            onPress={() => handleMonthChange('prev')}
            style={styles.monthButton}
          >
            <Icon name="chevron-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.monthText, { color: colors.text.primary }]}>
            {formatMonthYear(currentMonth.getTime())}
          </Text>
          
          <TouchableOpacity
            onPress={() => handleMonthChange('next')}
            style={styles.monthButton}
            disabled={currentMonth >= new Date()}
          >
            <Icon
              name="chevron-right"
              size={24}
              color={currentMonth >= new Date() ? colors.text.secondary : colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <BalanceCard
          balance={stats.balance}
          income={stats.totalIncome}
          expense={stats.totalExpense}
          currency={user?.currency || 'USD'}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: colors.success }]}
            onPress={() => handleAddTransaction('income')}
          >
            <Icon name="arrow-up" size={24} color="#FFFFFF" />
            <Text style={styles.quickButtonText}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: colors.error }]}
            onPress={() => handleAddTransaction('expense')}
          >
            <Icon name="arrow-down" size={24} color="#FFFFFF" />
            <Text style={styles.quickButtonText}>Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Recent Transactions
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Analytics')}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
            <Icon name="cash-multiple" size={64} color={colors.text.secondary} />
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              No Transactions Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              Start by adding your first income or expense
            </Text>
            <View style={styles.emptyButtons}>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.success }]}
                onPress={() => handleAddTransaction('income')}
              >
                <Icon name="arrow-up" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Add Income</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.error }]}
                onPress={() => handleAddTransaction('expense')}
              >
                <Icon name="arrow-down" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onPress={() => handleTransactionPress(transaction)}
                onDelete={() => handleTransactionDelete(transaction)}
              />
            ))}
          </View>
        )}

        {/* Spacing at bottom */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 60,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  monthButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 16,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    marginBottom: 8,
  },
  emptyContainer: {
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});