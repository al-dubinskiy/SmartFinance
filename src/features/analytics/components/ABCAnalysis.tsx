import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../core/hooks/useTheme';
import { formatCurrency } from '../../../core/utils/formatters';

interface ABCItem {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
  rank: 'A' | 'B' | 'C';
}

interface ABCAnalysisProps {
  data: ABCItem[];
  totalAmount: number;
  currency?: string;
}

export const ABCAnalysis: React.FC<ABCAnalysisProps> = ({
  data,
  totalAmount,
  currency = 'USD',
}) => {
  const { colors } = useTheme();

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'A':
        return '#E74C3C'; // Red - top priorities
      case 'B':
        return '#F39C12'; // Orange - moderate
      case 'C':
        return '#2ECC71'; // Green - low priorities
      default:
        return colors.text.secondary;
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'A':
        return 'star-circle';
      case 'B':
        return 'star';
      case 'C':
        return 'star-outline';
      default:
        return 'help';
    }
  };

  if (data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <Icon name="chart-arc" size={48} color={colors.text.secondary} />
        <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
          Add more expenses to see ABC analysis
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        ABC Analysis
      </Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        Based on Pareto Principle (80/20 rule)
      </Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E74C3C' }]} />
          <Text style={[styles.legendText, { color: colors.text.secondary }]}>
            A (70-80% of expenses)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F39C12' }]} />
          <Text style={[styles.legendText, { color: colors.text.secondary }]}>
            B (15-20% of expenses)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2ECC71' }]} />
          <Text style={[styles.legendText, { color: colors.text.secondary }]}>
            C (5-10% of expenses)
          </Text>
        </View>
      </View>

      {/* Categories List */}
      {data.map((item, index) => (
        <View key={index} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: item.categoryColor + '20' }]}>
              <Icon name={item.categoryIcon} size={20} color={item.categoryColor} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: colors.text.primary }]}>
                {item.categoryName}
              </Text>
              <Text style={[styles.categoryAmount, { color: colors.text.secondary }]}>
                {formatCurrency(item.amount, currency)}
              </Text>
            </View>
            <View
              style={[
                styles.rankBadge,
                { backgroundColor: getRankColor(item.rank) + '20' },
              ]}
            >
              <Icon
                name={getRankIcon(item.rank)}
                size={16}
                color={getRankColor(item.rank)}
              />
              <Text style={[styles.rankText, { color: getRankColor(item.rank) }]}>
                {item.rank}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${item.percentage}%`,
                  backgroundColor: getRankColor(item.rank),
                },
              ]}
            />
          </View>
          
          <Text style={[styles.percentageText, { color: colors.text.secondary }]}>
            {item.percentage.toFixed(1)}% of total expenses
          </Text>
        </View>
      ))}

      {/* Insight */}
      <View style={[styles.insightContainer, { backgroundColor: colors.background }]}>
        <Icon name="lightbulb" size={20} color={colors.primary} />
        <Text style={[styles.insightText, { color: colors.text.secondary }]}>
          Your top categories (A) account for {data.filter(d => d.rank === 'A').reduce((sum, d) => sum + d.percentage, 0).toFixed(1)}% of expenses. 
          Focus on reducing these for maximum impact.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: 12,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 10,
  },
  emptyContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});