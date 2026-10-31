import { formatMeter, QUOTA_BYTES } from "../core/storage";
import { useApp, useStoreVersion } from "./context";

export function StorageMeter() {
  const { store } = useApp();
  useStoreVersion();
  const used = store.bytesUsed();
  return (
    <div class="meter">
      <p>{formatMeter(used)}</p>
      {used >= QUOTA_BYTES * 0.8 && (
        <p role="status" class="warn">
          Storage is nearly full. Export your data, then delete old history entries.
        </p>
      )}
    </div>
  );
}
