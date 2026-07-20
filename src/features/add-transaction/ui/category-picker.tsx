import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { TransactionCategory, TransactionType } from '@/entities/transaction';
import { BackgroundColors, Spacing, TextColors } from '@/shared/config';
import { ThemedText } from '@/shared/ui';

type CategoryOption = {
  id: TransactionCategory;
  label: string;
  icon: string;
  color: string;
};

type CategoryPickerProps = {
  categories: readonly CategoryOption[];
  value?: TransactionCategory;
  error?: string;
  onChange: (value: TransactionCategory) => void;
  showTitle?: boolean;
  type: TransactionType;
  showAll?: boolean;
  showCreateTile?: boolean;
  onCreate?: () => void;
};

const COMPACT_CATEGORY_LIMIT = 7;

export function CategoryPicker({
  categories,
  value,
  error,
  onChange,
  showTitle = true,
  type,
  showAll = false,
  showCreateTile = false,
  onCreate,
}: CategoryPickerProps) {
  const overflowCategory =
    categories.find((category) => category.id.startsWith('other-')) ??
    ({
      id: 'other-expense',
      label: 'Other',
      icon: 'more-horiz',
      color: BackgroundColors.blue,
    } as const);
  const visibleCategories = showAll
    ? categories
    : categories.filter((category) => category.id !== overflowCategory.id).slice(0, COMPACT_CATEGORY_LIMIT);
  const showOverflow = !showAll && categories.length > visibleCategories.length;
  const overflowActive = !!value && !visibleCategories.some((category) => category.id === value);

  function openCategoryScreen() {
    router.push({
      pathname: '/category',
      params: {
        category: value,
        type,
      },
    });
  }

  return (
    <View style={styles.container}>
      {showTitle ? <ThemedText style={styles.title}>Category</ThemedText> : null}
      <View style={styles.grid}>
        {visibleCategories.map((category) => {
          const active = category.id === value;

          return (
            <Pressable key={category.id} onPress={() => onChange(category.id)} style={styles.item} testID={`category-tile-${category.id}`}>
              <View style={styles.content}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: category.color },
                    active ? styles.activeCircle : undefined,
                  ]}>
                  <MaterialIcons
                    color={BackgroundColors.white}
                    name={category.icon as keyof typeof MaterialIcons.glyphMap}
                    size={28}
                  />
                </View>
                <ThemedText style={styles.label}>{category.label}</ThemedText>
              </View>
            </Pressable>
          );
        })}

        {showOverflow ? (
          <Pressable onPress={openCategoryScreen} style={styles.item}>
            <View style={styles.content}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: overflowCategory.color },
                  overflowActive ? styles.activeCircle : undefined,
                ]}>
                <MaterialIcons
                  color={BackgroundColors.white}
                  name={overflowCategory.icon as keyof typeof MaterialIcons.glyphMap}
                  size={28}
                />
              </View>
              <ThemedText style={styles.label}>{overflowCategory.label}</ThemedText>
            </View>
          </Pressable>
        ) : null}

        {showAll && showCreateTile && onCreate ? (
          <Pressable onPress={onCreate} style={styles.item}>
            <View style={styles.content}>
              <View style={[styles.iconCircle, styles.createCircle]}>
                <MaterialIcons color={BackgroundColors.white} name="add" size={28} />
              </View>
              <ThemedText style={styles.label}>Create</ThemedText>
            </View>
          </Pressable>
        ) : null}
      </View>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  activeCircle: {
    borderColor: BackgroundColors.white,
    borderWidth: 3,
    shadowColor: BackgroundColors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  container: {
    gap: Spacing.m - Spacing.xs,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.s - Spacing.xs / 2,
  },
  createCircle: {
    backgroundColor: TextColors.tertiary,
  },
  error: {
    color: BackgroundColors.red,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.m - Spacing.xs / 2,
    justifyContent: 'space-between',
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  item: {
    width: '22%',
  },
  label: {
    color: TextColors.body,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
  },
  title: {
    color: BackgroundColors.white,
    fontSize: 15,
    lineHeight: 20,
  },
});