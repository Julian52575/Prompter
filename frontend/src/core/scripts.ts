import type { ArchiveFile } from "./archive";

// The helper scripts bundled into the project download come from the repository's scripts/shared folder,
// so they exist once. (In the dev container that folder is mounted at /scripts, the same relative path.)
const raw = import.meta.glob("../../../scripts/shared/*.{py,md,tsv}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const SHARED_SCRIPTS: ArchiveFile[] = Object.entries(raw)
  .map(([path, content]) => ({ path: `scripts/shared/${path.split("/").pop()}`, content }))
  .sort((a, b) => a.path.localeCompare(b.path));
