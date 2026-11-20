import { Language } from '../enums/Language.enum';

/**
 * "47 καταστήματα" / "47 stores", with the singular spelled out so the label
 * never reads "1 καταστήματα".
 */
export function formatStoreCount(storeCount: number, language: Language): string {
  if (language === Language.GREEK) {
    return storeCount === 1 ? '1 κατάστημα' : `${storeCount} καταστήματα`;
  }

  return storeCount === 1 ? '1 store' : `${storeCount} stores`;
}
