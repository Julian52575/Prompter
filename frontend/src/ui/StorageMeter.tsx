import { formatSize, QUOTA_BYTES } from "../core/storage";
import { useApp, useStoreVersion } from "./context";

export function StorageMeter() {
  const { store, t } = useApp();
  useStoreVersion();
  const used = store.bytesUsed();
  return (
    <div class="meter">
      <p>{t.meter.used(formatSize(used, t.locale))}</p>
      {used >= QUOTA_BYTES * 0.8 && (
        <p role="status" class="warn">
          {t.meter.nearlyFull}
        </p>
      )}
    </div>
  );
}
