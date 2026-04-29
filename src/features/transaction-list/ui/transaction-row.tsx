import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getCategoryDefinition, type Transaction } from '@/src/entities/transaction';
import { formatCurrency } from '@/src/shared/lib/currency';
import { formatTransactionDate } from '@/src/shared/lib/date';

type TransactionRowProps = {
  transaction: Transaction;
  onPress?: () => void;
};

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const category = getCategoryDefinition(transaction.category);
  const amountColor = transaction.type === 'income' ? styles.positive : styles.negative;
  const previewPhotos = transaction.photos?.slice(0, 2) ?? [];
  const remainingPhotos = Math.max(0, (transaction.photos?.length ?? 0) - previewPhotos.length);

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <View style={styles.card}>
        <View style={styles.mainRow}>
          <View style={styles.leadingGroup}>
            <View style={[styles.iconBadge, { backgroundColor: category?.color ?? '#5D96E6' }]}>
              <MaterialIcons color="#FFFFFF" name={(category?.icon as keyof typeof MaterialIcons.glyphMap) ?? 'more-horiz'} size={22} />
            </View>
            <View style={styles.textGroup}>
              <ThemedText type="defaultSemiBold">{category?.label ?? transaction.category}</ThemedText>
              <ThemedText style={styles.metaText}>
                {transaction.note?.trim() || formatTransactionDate(transaction.date)}
              </ThemedText>
              {previewPhotos.length > 0 ? (
                <View style={styles.photoPreviewRow}>
                  {previewPhotos.map((photoUri) => (
                    <Image
                      key={photoUri}
                      contentFit="cover"
                      source={{ uri: photoUri }}
                      style={styles.photoPreview}
                    />
                  ))}
                  {remainingPhotos > 0 ? (
                    <View style={styles.photoCountBadge}>
                      <ThemedText style={styles.photoCountText}>+{remainingPhotos}</ThemedText>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.amountGroup}>
            <ThemedText style={[styles.amount, amountColor]}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </ThemedText>
            <ThemedText style={styles.metaText}>{transaction.type === 'income' ? 'Income' : 'Expense'}</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontWeight: '700',
  },
  amountGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  card: {
    backgroundColor: '#F6F8FB',
    borderRadius: 24,
    gap: 0,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  leadingGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 14,
    paddingRight: 12,
  },
  mainRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: '#506B86',
    fontSize: 14,
    lineHeight: 20,
  },
  negative: {
    color: '#E46A60',
  },
  positive: {
    color: '#1FA37A',
  },
  pressable: {
    marginBottom: 10,
  },
  photoPreviewRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  photoPreview: {
    borderRadius: 10,
    height: 26,
    width: 26,
  },
  photoCountBadge: {
    alignItems: 'center',
    backgroundColor: '#DCE6F2',
    borderRadius: 10,
    height: 26,
    justifyContent: 'center',
    minWidth: 26,
    paddingHorizontal: 6,
  },
  photoCountText: {
    color: '#214C79',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
});