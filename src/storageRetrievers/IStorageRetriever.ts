import { Language } from "../enums/Language.enum";

/**
 * Interface for storage adapter operations
 * Defines standard methods for retrieving and storing data
 */
export interface IStorageRetrieverAdapter<T extends boolean | Language> {
  /**
   * Retrieves a value from storage
   * @returns The stored item value or null if not found
   */
  getValue(): T | null;
}
