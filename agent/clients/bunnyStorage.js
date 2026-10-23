import { getMimeType } from "./mimeTypes.js";

/**
 * Bunny Storage API: Upload file
 * Direct HTTP PUT without CLI
 */
export async function uploadStorageFile({
  storageZoneName,
  storagePassword,
  storageHostname = "storage.bunnycdn.com",
  remotePath,
  buffer,
  contentType,
}) {
  if (!storageZoneName || !storagePassword || !remotePath) {
    throw new Error("Missing required storage upload parameters");
  }

  // Normalize remotePath: remove leading slash
  const cleanPath = remotePath.replace(/^\/+/, "");
  const url = `https://${storageHostname}/${storageZoneName}/${cleanPath}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: storagePassword,
      "Content-Type": contentType || getMimeType(cleanPath),
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage upload failed for ${cleanPath} (HTTP ${res.status}): ${text}`);
  }

  return { success: true, path: cleanPath };
}

/**
 * Bunny Storage API: List files in remote folder
 */
export async function listStorageFiles({
  storageZoneName,
  storagePassword,
  storageHostname = "storage.bunnycdn.com",
  remotePath = "",
}) {
  const cleanPath = remotePath.replace(/^\/+/, "");
  const url = `https://${storageHostname}/${storageZoneName}/${cleanPath ? cleanPath + "/" : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      AccessKey: storagePassword,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    return [];
  }

  try {
    return await res.json();
  } catch (e) {
    console.warn(`[BunnyStorage] Failed to parse JSON file list for path '${cleanPath}': ${e.message}`);
    return [];
  }
}

/**
 * Bunny Storage API: Delete file or directory
 */
export async function deleteStoragePath({
  storageZoneName,
  storagePassword,
  storageHostname = "storage.bunnycdn.com",
  remotePath,
  isDirectory = false,
}) {
  if (!storageZoneName || !storagePassword || !remotePath) {
    throw new Error("Missing required storage delete parameters");
  }

  let cleanPath = remotePath.replace(/^\/+/, "");
  if (isDirectory && !cleanPath.endsWith("/")) {
    cleanPath += "/";
  }

  const url = `https://${storageHostname}/${storageZoneName}/${cleanPath}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      AccessKey: storagePassword,
    },
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Storage delete failed for ${cleanPath} (HTTP ${res.status}): ${text}`);
  }

  return { success: true, path: cleanPath };
}

/**
 * Smart Sync Clean:
 * Inspects remote Bunny Storage Zone and removes files/directories that do not belong to activeFilesList.
 */
export async function cleanStaleStorageFiles({
  storageZoneName,
  storagePassword,
  storageHostname = "storage.bunnycdn.com",
  activeFilesList = [],
  onLog = () => {},
}) {
  const activeSet = new Set(
    activeFilesList.map((f) => f.replace(/^\/+/, "").replace(/\\/g, "/"))
  );
  const activeDirs = new Set();
  for (const f of activeSet) {
    const parts = f.split("/");
    for (let i = 1; i < parts.length; i++) {
      activeDirs.add(parts.slice(0, i).join("/"));
    }
  }

  let deletedCount = 0;

  // 1. List root directory
  const rootEntries = await listStorageFiles({
    storageZoneName,
    storagePassword,
    storageHostname,
    remotePath: "",
  });

  for (const entry of rootEntries) {
    const objectName = entry.ObjectName;
    if (!objectName) continue;

    if (entry.IsDirectory) {
      // If this directory is not needed at all by any active file, delete the whole folder recursively
      if (!activeDirs.has(objectName)) {
        onLog(`Cleaning obsolete directory: ${objectName}/...`);
        try {
          await deleteStoragePath({
            storageZoneName,
            storagePassword,
            storageHostname,
            remotePath: objectName,
            isDirectory: true,
          });
          deletedCount++;
        } catch (e) {
          onLog(`Notice: could not delete ${objectName}/: ${e.message}`, "warning");
        }
      } else {
        // Directory is needed (e.g. "assets"), but some files inside it might be old hashed chunks
        const subEntries = await listStorageFiles({
          storageZoneName,
          storagePassword,
          storageHostname,
          remotePath: objectName,
        });

        for (const sub of subEntries) {
          const subPath = `${objectName}/${sub.ObjectName}`;
          if (!sub.IsDirectory && !activeSet.has(subPath)) {
            onLog(`Cleaning obsolete asset: ${subPath}...`);
            try {
              await deleteStoragePath({
                storageZoneName,
                storagePassword,
                storageHostname,
                remotePath: subPath,
                isDirectory: false,
              });
              deletedCount++;
            } catch (e) {
              onLog(`Notice: could not delete ${subPath}: ${e.message}`, "warning");
            }
          }
        }
      }
    } else {
      // Top-level file
      if (!activeSet.has(objectName)) {
        onLog(`Cleaning obsolete file: ${objectName}...`);
        try {
          await deleteStoragePath({
            storageZoneName,
            storagePassword,
            storageHostname,
            remotePath: objectName,
            isDirectory: false,
          });
          deletedCount++;
        } catch (e) {
          onLog(`Notice: could not delete ${objectName}: ${e.message}`, "warning");
        }
      }
    }
  }

  return { deletedCount };
}
