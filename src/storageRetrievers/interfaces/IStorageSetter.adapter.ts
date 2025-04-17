import { Language } from "../../enums/Language.enum";

/**
 * Interface for storage adapter operations
 * Defines standard methods for retrieving and storing data
 */
export interface IStorageSetterAdapter<T extends boolean | Language | number> {
  /**
   * Stores a value in storage
   * @param value The value to store
   */
  setValue(value: T): void;
}
