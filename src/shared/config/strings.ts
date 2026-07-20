/**
 * Centralized user-facing string table.
 *
 * Keeping strings in one place is a prerequisite for any future i18n work
 * (whatever library/format is chosen later — JSON catalogs, ICU, lingui, …
 * the call sites stay stable). For now this is a plain TS object: no runtime
 * formatting layer, no language switching — just a single source of truth.
 *
 * Conventions:
 *   - Group by feature/screen, not by widget kind.
 *   - Prefer full sentences over fragments so translators get context.
 *   - Use `(args) => string` for any interpolated string so the call site
 *     never concatenates manually.
 */
export const Strings = {
  common: {
    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save',
    tryAgain: 'Try again',
    discard: 'Discard',
    keepEditing: 'Keep editing',
    goBack: 'Go back',
  },
  errorBoundary: {
    title: 'Something went wrong',
    fallbackMessage: 'An unexpected error occurred.',
  },
  tabs: {
    home: 'Home',
    transactions: 'Transactions',
  },
  transactionForm: {
    titleEdit: 'Edit transaction',
    titleCreate: 'Add transactions',
    photoSaveFailedTitle: 'Photo save failed',
    photoSaveFailedGeneric: 'The selected receipt could not be saved locally. Please try again.',
    permissionTitle: 'Photos permission needed',
    permissionMessage:
      'Allow photo library access to attach receipt images to a transaction.',
    deleteTitle: 'Delete transaction',
    deleteMessage: 'This action cannot be undone.',
    discardTitle: 'Discard changes?',
    discardMessage: 'You have unsaved changes. Are you sure you want to discard them?',
    errorAmountPositive: 'Enter a positive amount',
    errorAmountTooLarge: 'Amount is too large',
    errorCategoryRequired: 'Select a category',
    errorDateFormat: 'Use YYYY-MM-DD',
    errorDateFuture: 'Date cannot be in the future',
  },
  category: {
    pickTitle: 'Category',
    createTitle: 'Create category',
    errorNameRequired: 'Enter a category name',
    errorNameTaken: 'A category with this name already exists',
  },
} as const;
