import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { selectAddCustomCategory, useCustomCategoryStore } from '@/entities/category';
import type { TransactionType } from '@/entities/transaction';
import { setPendingCategorySelection } from '@/features/add-transaction/model/category-selection';
import { TypeSwitch } from '@/features/add-transaction/ui/type-switch';
import { BackgroundColors, Colors, Spacing, TextColors, useCategoriesByType } from '@/shared/config';
import { Screen, ThemedText } from '@/shared/ui';

const ICON_OPTIONS = {
  expense: [
    'favorite',
    'home',
    'local-cafe',
    'stars',
    'groups',
    'restaurant',
    'spa',
    'directions-car',
    'shopping-cart',
    'pets',
    'sports-soccer',
    'flight-takeoff',
    'more-horiz',
  ],
  income: [
    'payments',
    'work',
    'card-giftcard',
    'trending-up',
    'account-balance-wallet',
    'savings',
    'paid',
    'attach-money',
    'monetization-on',
    'redeem',
    'currency-exchange',
    'account-balance',
    'add-circle-outline',
  ],
} as const satisfies Record<TransactionType, readonly (keyof typeof MaterialIcons.glyphMap)[]>;

const ICON_LABELS: Record<keyof typeof MaterialIcons.glyphMap, string> = {
  favorite: 'Health',
  home: 'Home',
  'local-cafe': 'Cafe',
  stars: 'Free time',
  groups: 'Family',
  restaurant: 'Food',
  spa: 'Beauty',
  'directions-car': 'Car',
  'shopping-cart': 'Shopping',
  pets: 'Pet',
  'sports-soccer': 'Sport',
  'flight-takeoff': 'Trips',
  'more-horiz': 'Other',
  payments: 'Salary',
  work: 'Freelance',
  'card-giftcard': 'Gift',
  'trending-up': 'Investment',
  'account-balance-wallet': 'Wallet',
  savings: 'Savings',
  paid: 'Paid',
  'attach-money': 'Cash',
  'monetization-on': 'Bonus',
  redeem: 'Reward',
  'currency-exchange': 'Exchange',
  'account-balance': 'Bank',
  'add-circle-outline': 'Other',
};

const COLOR_OPTIONS = [
  BackgroundColors.lightGray,
  BackgroundColors.blue,
  BackgroundColors.pink,
  BackgroundColors.purpure,
  BackgroundColors.orange,
  BackgroundColors.darkGreen,
  BackgroundColors.darkBlue,
  BackgroundColors.yellow,
  BackgroundColors.orange,
] as const;

const CUSTOM_COLOR_OPTIONS = [
  '#5999E2',
  '#FE3FA8',
  '#8E6AC8',
  '#D88239',
  '#1F8C34',
  '#135DB2',
  '#F0D463',
  '#FFA953',
] as const;

function slugifyCategoryLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildCustomCategoryId(label: string, type: TransactionType, existingIds: readonly string[]) {
  const base = slugifyCategoryLabel(label) || 'custom-category';
  let candidate = `custom-${type}-${base}`;
  let suffix = 2;

  while (existingIds.includes(candidate)) {
    candidate = `custom-${type}-${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function CreateCategoryScreen() {
  const params = useLocalSearchParams<{ type?: string | string[] }>();
  const initialType = Array.isArray(params.type) ? params.type[0] : params.type;
  const [selectedType, setSelectedType] = useState<TransactionType>(
    initialType === 'income' ? 'income' : 'expense'
  );
  const [label, setLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<(typeof ICON_OPTIONS)[TransactionType][number]>(
    ICON_OPTIONS[initialType === 'income' ? 'income' : 'expense'][0]
  );
  const [selectedColor, setSelectedColor] = useState<string>(BackgroundColors.darkBlue);
  const [showExtendedColors, setShowExtendedColors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addCustomCategory = useCustomCategoryStore(selectAddCustomCategory);
  const categories = useCategoriesByType(selectedType);
  const iconOptions = ICON_OPTIONS[selectedType];
  const normalizedLabel = label.trim();
  const paletteOptions = showExtendedColors ? CUSTOM_COLOR_OPTIONS : COLOR_OPTIONS;

  useEffect(() => {
    if (!iconOptions.includes(selectedIcon)) {
      setSelectedIcon(iconOptions[0]);
    }
  }, [iconOptions, selectedIcon]);

  const labelTaken = useMemo(
    () =>
      categories.some((category) => category.label.trim().toLowerCase() === normalizedLabel.toLowerCase()),
    [categories, normalizedLabel]
  );

  const isValid = normalizedLabel.length > 0 && !labelTaken;

  function handleSubmit() {
    if (!normalizedLabel) {
      setError('Enter a category name');
      return;
    }

    if (labelTaken) {
      setError('A category with this name already exists');
      return;
    }

    const nextCategoryId = buildCustomCategoryId(
      normalizedLabel,
      selectedType,
      categories.map((category) => category.id)
    );

    addCustomCategory({
      color: selectedColor,
      icon: selectedIcon,
      id: nextCategoryId,
      label: normalizedLabel,
      type: selectedType,
    });
    setPendingCategorySelection({ category: nextCategoryId, type: selectedType });
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen scroll={false} style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.topBar}>
          <MaterialIcons color={TextColors.brand} name="chevron-left" size={28} />
          <ThemedText type="defaultSemiBold" style={styles.topBarTitle}>
            Create category
          </ThemedText>
        </Pressable>

        <View style={styles.nameRow}>
          <View style={[styles.selectedIconBadge, { backgroundColor: selectedColor }]}> 
            <MaterialIcons color={BackgroundColors.white} name={selectedIcon} size={28} />
          </View>
          <View style={styles.nameFieldWrap}>
            <TextInput
              autoCapitalize="words"
              onChangeText={(value) => {
                setLabel(value);
                if (error) {
                  setError(null);
                }
              }}
              placeholder="Sport"
              placeholderTextColor={Colors.dark.muted}
              style={styles.nameInput}
              value={label}
            />
            <View style={styles.nameUnderline} />
          </View>
        </View>

        <View style={styles.typeSwitchWrap}>
          <TypeSwitch value={selectedType} onChange={setSelectedType} />
        </View>

        <View style={styles.iconGrid}>
          {iconOptions.map((iconName) => {
            const active = iconName === selectedIcon;

            return (
              <Pressable key={iconName} onPress={() => setSelectedIcon(iconName)} style={styles.iconItem}>
                <View
                  style={[
                    styles.iconCircle,
                    active ? [styles.iconCircleActive, { backgroundColor: selectedColor }] : styles.iconCircleInactive,
                  ]}>
                  <MaterialIcons color={BackgroundColors.white} name={iconName} size={28} />
                </View>
                <ThemedText style={styles.iconLabel}>{ICON_LABELS[iconName]}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.colorSection}>
          <ThemedText style={styles.sectionTitle}>Color</ThemedText>
          <View style={styles.colorRow}>
            <Pressable
              onPress={() => setShowExtendedColors((current) => !current)}
              style={[styles.colorSwatch, styles.colorPickerTrigger]}>
              <MaterialIcons color={BackgroundColors.white} name="add" size={18} />
            </Pressable>

            {paletteOptions.map((colorOption, index) => {
              const active = colorOption === selectedColor;

              return (
                <Pressable
                  key={`${colorOption}-${index}`}
                  onPress={() => setSelectedColor(colorOption)}
                  style={[styles.colorSwatch, { backgroundColor: colorOption }, active && styles.colorSwatchActive]}>
                  {active ? <MaterialIcons color={BackgroundColors.white} name="check" size={20} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <Pressable
          accessibilityRole="button"
          disabled={!isValid}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            !isValid && styles.submitButtonDisabled,
            pressed && isValid && styles.submitButtonPressed,
          ]}>
          <ThemedText style={styles.submitLabel}>Add</ThemedText>
        </Pressable>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.s,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  colorSection: {
    gap: Spacing.s,
    marginTop: 'auto',
  },
  colorSwatch: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  colorSwatchActive: {
    borderColor: BackgroundColors.white,
    borderWidth: 2,
  },
  colorPickerTrigger: {
    backgroundColor: BackgroundColors.lightGray,
  },
  errorText: {
    color: BackgroundColors.red,
    fontSize: 13,
    lineHeight: 18,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  iconCircleActive: {
    borderColor: BackgroundColors.white,
    borderWidth: 2,
    shadowColor: BackgroundColors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircleInactive: {
    backgroundColor: BackgroundColors.lightGray,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.m - Spacing.xs / 2,
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '22%',
  },
  iconLabel: {
    alignSelf: 'stretch',
    color: TextColors.body,
    fontSize: 13,
    lineHeight: 17,
    marginTop: Spacing.s - Spacing.xs / 2,
    minHeight: 34,
    textAlign: 'center',
    textAlignVertical: 'top',
  },
  nameFieldWrap: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameInput: {
    color: BackgroundColors.white,
    fontSize: 30,
    lineHeight: 36,
    paddingVertical: 0,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.s + Spacing.xs / 2,
  },
  nameUnderline: {
    backgroundColor: TextColors.tertiary,
    height: 1,
  },
  screen: {
    backgroundColor: BackgroundColors.bg,
    flex: 1,
  },
  sectionTitle: {
    color: BackgroundColors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  selectedIconBadge: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  submitButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: TextColors.tertiary,
    borderRadius: 999,
    justifyContent: 'center',
    marginTop: Spacing.l,
    minHeight: 56,
    minWidth: 260,
    shadowColor: BackgroundColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    width: '74%',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  submitLabel: {
    color: BackgroundColors.white,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 22,
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