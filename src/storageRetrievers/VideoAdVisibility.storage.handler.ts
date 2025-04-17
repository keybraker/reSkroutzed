import { IStorageRetrieverAdapter } from "./interfaces/IStorageRetriever.adapter";
import { IStorageSetterAdapter } from "./interfaces/IStorageSetter.adapter";

export class VideoAdVisibilityStorageAdapter
  implements IStorageRetrieverAdapter<boolean>, IStorageSetterAdapter<boolean>
{
  private readonly key = "RESKROUTZED-video-ad-visibility";

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
