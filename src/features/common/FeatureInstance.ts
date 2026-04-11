export interface FeatureInstance {
  execute(): void;
  destroy?(): void;
}
