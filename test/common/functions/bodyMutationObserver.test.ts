import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type FakeObserver = {
  callback: MutationCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

describe('onBodyMutations', () => {
  let observers: FakeObserver[];
  let onBodyMutations: typeof import('../../../src/common/functions/bodyMutationObserver').onBodyMutations;
  let BODY_MUTATION_DEBOUNCE_MS: number;

  const emit = (observer: FakeObserver, records: MutationRecord[]): void => {
    observer.callback(records, observer as unknown as MutationObserver);
  };

  const childListRecord = (): MutationRecord =>
    ({ type: 'childList' }) as unknown as MutationRecord;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    observers = [];

    class FakeMutationObserver {
      public readonly observe = vi.fn();
      public readonly disconnect = vi.fn();

      constructor(public readonly callback: MutationCallback) {
        observers.push(this as unknown as FakeObserver);
      }
    }

    vi.stubGlobal('MutationObserver', FakeMutationObserver);

    ({ onBodyMutations, BODY_MUTATION_DEBOUNCE_MS } = await import(
      '../../../src/common/functions/bodyMutationObserver'
    ));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('shares one observer across every subscriber', () => {
    // Act
    onBodyMutations(vi.fn());
    onBodyMutations(vi.fn());

    // Assert
    expect(observers).toHaveLength(1);
    expect(observers[0].observe).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true,
    });
  });

  it('coalesces a burst into one delayed callback', () => {
    // Arrange
    const subscriber = vi.fn();
    onBodyMutations(subscriber);
    const observer = observers[0];

    // Act
    emit(observer, [childListRecord()]);
    emit(observer, [childListRecord()]);

    // Assert
    expect(subscriber).not.toHaveBeenCalled();

    vi.advanceTimersByTime(BODY_MUTATION_DEBOUNCE_MS);

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber.mock.calls[0][0]).toHaveLength(2);
  });

  it('keeps the observer alive while other subscribers remain', () => {
    // Arrange
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = onBodyMutations(first);
    onBodyMutations(second);
    const observer = observers[0];

    // Act
    unsubscribeFirst();
    emit(observer, [childListRecord()]);
    vi.advanceTimersByTime(BODY_MUTATION_DEBOUNCE_MS);

    // Assert
    expect(observer.disconnect).not.toHaveBeenCalled();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('disconnects and drops a pending batch when the last subscriber leaves', () => {
    // Arrange
    const subscriber = vi.fn();
    const unsubscribe = onBodyMutations(subscriber);
    const observer = observers[0];
    emit(observer, [childListRecord()]);

    // Act
    unsubscribe();
    vi.advanceTimersByTime(BODY_MUTATION_DEBOUNCE_MS);

    // Assert
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(subscriber).not.toHaveBeenCalled();
  });
});
