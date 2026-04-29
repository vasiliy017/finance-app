import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { BackgroundColors, Spacing, TextColors } from '@/constants/theme';
import {
  calculateCategoryTotals,
  calculateTransactionTotals,
  getCategoryDefinition,
  selectHydrated,
  selectTransactions,
  type TransactionType,
  useTransactionStore,
} from '@/src/entities/transaction';
import { formatCurrency } from '@/src/shared/lib/currency';
import { Card, EmptyState, LoadingState, Screen } from '@/src/shared/ui';

const PERIOD_LABELS = ['Day', 'Week', 'Month', 'Year', 'Date'] as const;
const DONUT_SIZE = 184;
const DONUT_STROKE = 22;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE) / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const CHART_PALETTE = [
  BackgroundColors.purpure,
  BackgroundColors.red,
  BackgroundColors.yellow,
  BackgroundColors.brown,
  BackgroundColors.blue,
] as const;
const DONUT_TRACK_COLOR = BackgroundColors.lightGray;
const compactGap = Spacing.s - Spacing.xs / 2;
const fieldGap = Spacing.s + Spacing.xs / 2;
const sectionGap = Spacing.m - Spacing.xs;
const chipInset = Spacing.m - Spacing.xs;
const extendedInset = Spacing.xxl + Spacing.s;

type ChartSegment = {
  color: string;
  value: number;
};

function formatDashboardDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  });
}

function DashboardDonut({ amountLabel, segments }: { amountLabel: string; segments: ChartSegment[] }) {
  const resolvedSegments = segments.length > 0 ? segments : [{ color: DONUT_TRACK_COLOR, value: 1 }];
  const total = resolvedSegments.reduce((sum, segment) => sum + segment.value, 0);
  let accumulated = 0;

  return (
    <View style={styles.chartShell}>
      <Svg height={DONUT_SIZE} width={DONUT_SIZE}>
        <Circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          fill="none"
          r={DONUT_RADIUS}
          stroke={DONUT_TRACK_COLOR}
          strokeWidth={DONUT_STROKE}
        />
        {resolvedSegments.map((segment, index) => {
          const rawLength = (segment.value / total) * DONUT_CIRCUMFERENCE;
          const visibleLength = resolvedSegments.length === 1 ? rawLength : Math.max(0, rawLength - 6);
          const rotation = (accumulated / total) * 360 - 90;

          accumulated += segment.value;

          return (
            <G
              key={`${segment.color}-${index}`}
              originX={DONUT_SIZE / 2}
              originY={DONUT_SIZE / 2}
              rotation={rotation}>
              <Circle
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                fill="none"
                r={DONUT_RADIUS}
                stroke={segment.color}
                strokeDasharray={`${visibleLength} ${DONUT_CIRCUMFERENCE}`}
                strokeLinecap="round"
                strokeWidth={DONUT_STROKE}
              />
            </G>
          );
        })}
      </Svg>

      <View style={styles.chartCenter}>
        <ThemedText style={styles.chartValue}>{amountLabel}</ThemedText>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const hydrated = useTransactionStore(selectHydrated);
  const transactions = useTransactionStore(selectTransactions);
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const totals = useMemo(() => calculateTransactionTotals(transactions), [transactions]);
  const allCategoryTotals = useMemo(
    () => calculateCategoryTotals(transactions, activeType),
    [activeType, transactions]
  );
  const categoryTotals = useMemo(() => allCategoryTotals.slice(0, 4), [allCategoryTotals]);

  const chartSegments = useMemo(
    () => {
      const topSegments = categoryTotals.map((item, index) => ({
        color: CHART_PALETTE[index] ?? getCategoryDefinition(item.category)?.color ?? BackgroundColors.blue,
        value: item.total,
      }));
      const remainingTotal = allCategoryTotals
        .slice(categoryTotals.length)
        .reduce((sum, item) => sum + item.total, 0);

      if (remainingTotal > 0) {
        topSegments.push({
          color: CHART_PALETTE[topSegments.length] ?? BackgroundColors.blue,
          value: remainingTotal,
        });
      }

      return topSegments;
    },
    [allCategoryTotals, categoryTotals]
  );

  const featuredTotal = activeType === 'expense' ? totals.expense : totals.income;

  function openCreateTransaction() {
    router.push('/transaction');
  }

  function openTransactions() {
    router.push('/(tabs)/transactions');
  }

  return (
    <Screen>
      <View style={styles.heroHeader}>
        <View style={styles.heroTopRow}>
          <View style={styles.headerIconButton}>
            <MaterialIcons color={TextColors.body} name="menu" size={28} />
          </View>

          <View style={styles.totalWrap}>
            <View style={styles.titleRow}>
              <MaterialIcons color={TextColors.tertiary} name="lightbulb-outline" size={24} />
              <ThemedText type="subtitle">Total</ThemedText>
            </View>
            <ThemedText adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} type="title" style={styles.totalAmount}>
              {formatCurrency(totals.balance)}
            </ThemedText>
          </View>

          <Pressable accessibilityRole="button" onPress={openTransactions} style={styles.headerIconButton}>
            <MaterialIcons color={TextColors.body} name="receipt-long" size={26} />
          </Pressable>
        </View>

      </View>

      <View style={styles.typeTabs}>
        <Pressable onPress={() => setActiveType('expense')} style={styles.typeTab}>
          <ThemedText style={activeType === 'expense' ? styles.typeTabActive : styles.typeTabIdle}>
            Expenses
          </ThemedText>
        </Pressable>
        <Pressable onPress={() => setActiveType('income')} style={styles.typeTab}>
          <ThemedText style={activeType === 'income' ? styles.typeTabActive : styles.typeTabIdle}>
            Income
          </ThemedText>
        </Pressable>
      </View>

      <Card style={styles.analyticsCard}>
        <View style={styles.periodRow}>
          {PERIOD_LABELS.map((label, index) => (
            <View key={label} style={[styles.periodChip, index === 0 && styles.periodChipActive]}>
              <ThemedText style={index === 0 ? styles.periodChipTextActive : styles.periodChipText}>
                {label}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.dateRow}>
          <MaterialIcons color={TextColors.brand} name="chevron-left" size={28} />
          <ThemedText type="subtitle" style={styles.dateLabel}>
            {formatDashboardDate(Date.now())}
          </ThemedText>
          <MaterialIcons color={TextColors.brand} name="chevron-right" size={28} />
        </View>

        <DashboardDonut amountLabel={formatCurrency(featuredTotal)} segments={chartSegments} />

        {!hydrated ? (
          <LoadingState label="Calculating category totals..." />
        ) : categoryTotals.length === 0 ? (
          <EmptyState
            actionLabel="Add transaction"
            description="Add a few transactions to start building your spending mix."
            onAction={openCreateTransaction}
            title="No category data yet"
          />
        ) : null}

        <Pressable accessibilityRole="button" onPress={openCreateTransaction} style={styles.floatingAddButton}>
          <MaterialIcons color={BackgroundColors.white} name="add" size={28} />
        </Pressable>
      </Card>

      {hydrated && categoryTotals.length > 0 ? (
        <View style={styles.summaryList}>
          {categoryTotals.map((item) => {
            const category = getCategoryDefinition(item.category);

            return (
              <View key={item.category} style={styles.summaryRowCard}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryLeading}>
                    <View style={[styles.categoryBadge, { backgroundColor: category?.color ?? BackgroundColors.blue }]}> 
                      <MaterialIcons
                        color={BackgroundColors.white}
                        name={(category?.icon as keyof typeof MaterialIcons.glyphMap) ?? 'more-horiz'}
                        size={20}
                      />
                    </View>
                    <ThemedText type="defaultSemiBold" style={styles.categoryText}>
                      {category?.label ?? item.category}
                    </ThemedText>
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.categoryValue}>
                    {formatCurrency(item.total)}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

    </Screen>
  );
}

const styles = StyleSheet.create({
  analyticsCard: {
    backgroundColor: BackgroundColors.window,
    borderColor: BackgroundColors.white,
    overflow: 'hidden',
    paddingBottom: compactGap,
    position: 'relative',
  },
  categoryBadge: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  categoryLeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: fieldGap,
  },
  categoryText: {
    color: TextColors.brand,
    fontSize: 15,
    lineHeight: 20,
  },
  categoryValue: {
    color: TextColors.brand,
    fontSize: 15,
    lineHeight: 20,
  },
  categoryList: {
    gap: sectionGap,
    paddingRight: extendedInset,
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartShell: {
    alignItems: 'center',
    paddingBottom: compactGap,
    paddingTop: 0,
    position: 'relative',
  },
  chartCenter: {
    alignItems: 'center',
    backgroundColor: BackgroundColors.window,
    borderRadius: 68,
    height: 136,
    justifyContent: 'center',
    position: 'absolute',
    width: 136,
  },
  chartValue: {
    color: TextColors.tertiary,
    fontSize: 22,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    transform: [{ translateY: 1 }],
  },
  dateLabel: {
    color: TextColors.brand,
    textDecorationLine: 'underline',
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs / 2,
  },
  floatingAddButton: {
    alignItems: 'center',
    backgroundColor: TextColors.tertiary,
    borderRadius: 22,
    bottom: 28,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
    width: 44,
  },
  heroHeader: {
    alignItems: 'center',
    gap: sectionGap,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.s,
    width: '100%',
  },
  headerIconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  periodChip: {
    borderRadius: 16,
    paddingHorizontal: chipInset,
    paddingVertical: Spacing.s,
  },
  periodChipActive: {
    backgroundColor: TextColors.tertiary,
  },
  periodChipText: {
    color: TextColors.brand,
    fontSize: 13,
    lineHeight: 18,
  },
  periodChipTextActive: {
    color: TextColors.brand,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    marginBottom: Spacing.xs / 2,
  },
  summaryList: {
    gap: Spacing.xs,
    marginTop: 0,
  },
  summaryRowCard: {
    backgroundColor: BackgroundColors.window,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: Spacing.m,
    paddingVertical: 0,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.s,
  },
  totalAmount: {
    color: TextColors.tertiary,
    fontSize: 29,
    letterSpacing: 0.2,
    lineHeight: 32,
    textAlign: 'center',
  },
  totalWrap: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
  },
  typeTab: {
    paddingBottom: compactGap,
  },
  typeTabActive: {
    color: TextColors.secondary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    textDecorationLine: 'underline',
  },
  typeTabIdle: {
    color: TextColors.body,
    fontSize: 18,
    lineHeight: 24,
  },
  typeTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
    paddingHorizontal: 0,
  },
});
