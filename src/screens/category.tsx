import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { TransactionCategory, TransactionType } from '@/entities/transaction';
import {
  setPendingCategorySelection,
  usePendingCategorySelection,
} from '@/features/add-transaction/model/category-selection';
import { CategoryPicker } from '@/features/add-transaction/ui/category-picker';
import { TypeSwitch } from '@/features/add-transaction/ui/type-switch';
import { BackgroundColors, Spacing, TextColors, useCategoriesByType } from '@/shared/config';
import { Screen, ThemedText } from '@/shared/ui';

export function CategoryScreen() {
  const params = useLocalSearchParams<{ category?: string | string[]; type?: string | string[] }>();
  const initialType = Array.isArray(params.type) ? params.type[0] : params.type;
  const initialCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const [selectedType, setSelectedType] = useState<TransactionType>(
    initialType === 'income' ? 'income' : 'expense'
  );
  const [selectedCategory] = useState<TransactionCategory | undefined>(
    initialCategory as TransactionCategory | undefined
  );
  const pendingCategorySelection = usePendingCategorySelection();
  const categories = useCategoriesByType(selectedType);

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
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.topBar}>
          <MaterialIcons color={TextColors.brand} name="chevron-left" size={28} />
          <ThemedText type="defaultSemiBold" style={styles.topBarTitle}>
            Category
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