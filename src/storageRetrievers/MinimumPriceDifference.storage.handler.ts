import { IStorageRetrieverAdapter } from "./IStorageRetriever";
import { IStorageSetterAdapter } from "./IStorageSetter";

export class MinimumPriceDifferenceStorageAdapter
  implements IStorageRetrieverAdapter<number>, IStorageSetterAdapter<number>
{
  private readonly key = "RESKROUTZED-minimum-difference";

  public getValue(): number | null {
    const item = localStorage.getItem(this.key);

    if (!item) {
      return null;
    }

    return parseFloat(item);
  }

  public setValue(value: number): void {
    localStorage.setItem(this.key, value.toString());
  }
}
