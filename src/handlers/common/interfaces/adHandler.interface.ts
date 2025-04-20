export interface AdHandlerInterface {
  /**
   * Flags elements according to handler-specific criteria
   * Each handler must implement this method
   */
  flag(): void;

  /**
   * Updates element visibility based on state
   */
  visibilityUpdate(): void;
}
