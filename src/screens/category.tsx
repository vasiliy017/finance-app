import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { TransactionCategory, TransactionType } from '@/entities/transaction';
import { asTransactionCategory } from '@/entities/transaction';
import {
  clearPendingCategorySelection,
  setPendingCategorySelection,
  usePendingCategorySelection,
} from '@/features/add-transaction/model/category-selection';
import { CategoryPicker } from '@/features/add-transaction/ui/category-picker';
import { TypeSwitch } from '@/features/add-transaction/ui/type-switch';
import { BackgroundColors, Spacing, Strings, TextColors, useCategoriesByType } from '@/shared/config';
import { useTypedSearchParams } from '@/shared/hooks';
import { Screen, ThemedText } from '@/shared/ui';

export function CategoryScreen() {
  const { category: initialCategory, type: initialType } = useTypedSearchParams([
    'category',
    'type',
  ] as const);
  const [selectedType, setSelectedType] = useState<TransactionType>(
    initialType === 'income' ? 'income' : 'expense'
  );
  const selectedCategory: TransactionCategory | undefined = initialCategory
    ? asTransactionCategory(initialCategory)
    : undefined;
  const pendingCategorySelection = usePendingCategorySelection();
  const categories = useCategoriesByType(selectedType);

  // Discard any stale pending selection left over from a previous flow so the
  // focus-effect below cannot immediately auto-dismiss this screen.
  useEffect(() => {
    clearPendingCategorySelection();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (pendingCategorySelection) {
        router.back();
      }
    }, [pendingCategorySelection])
  );

  function handleSelect(category: TransactionCategory) {
    setPendingCategorySelection({ category, type: selectedType });
    router.back();
  }

  function handleCreate() {
    router.push({
      pathname: '/create-category',
      params: {
        type: selectedType,
      },
    });
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen scroll={false} style={styles.screen}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.topBar}
        >
          <MaterialIcons color={TextColors.brand} name="chevron-left" size={28} />
          <ThemedText type="defaultSemiBold" style={styles.topBarTitle}>
            {Strings.category.pickTitle}
          </ThemedText>
        </Pressable>

        <View style={styles.typeSwitchWrap}>
          <TypeSwitch value={selectedType} onChange={setSelectedType} />
        </View>

        <CategoryPicker
          categories={categories}
          onChange={handleSelect}
          onCreate={handleCreate}
          showAll
          showCreateTile
          showTitle={false}
          type={selectedType}
          value={selectedCategory}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: BackgroundColors.bg,
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: BackgroundColors.white,
    borderRadius: 18,
    flexDirection: 'row',
    gap: Spacing.s,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s + Spacing.xs / 2,
  },
  topBarTitle: {
    color: TextColors.brand,
    fontSize: 16,
  },
  typeSwitchWrap: {
    paddingTop: Spacing.s,
  },
});