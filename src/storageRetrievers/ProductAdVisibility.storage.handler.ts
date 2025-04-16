import { IStorageRetrieverAdapter } from "./IStorageRetriever";
import { IStorageSetterAdapter } from "./IStorageSetter";

export class ProductAdVisibilityStorageAdapter
  implements IStorageRetrieverAdapter<boolean>, IStorageSetterAdapter<boolean>
{
  private readonly key = "RESKROUTZED-sponsored-visibility";

  public getValue(): boolean | null {
    const item = localStorage.getItem(this.key);

    if (!item) {
      return null;
    }

    return item === "true";
  }

  public setValue(value: boolean): void {
    localStorage.setItem(this.key, value.toString());
  }
}
