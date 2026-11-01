"use client";

import { toast } from "sonner";
import {
  restoreGame,
  type RemovedGame,
} from "@/src/app/dashboard/games/actions";

/**
 * Remove a game and offer an Undo toast straight away. Callers update their
 * UI optimistically before calling; `onFailed` reverts it if the delete
 * fails, `onRestored` re-shows it after a successful undo.
 */
export function removeWithUndo({
  title,
  remove,
  onFailed,
  onRestored,
}: {
  title: string;
  remove: () => Promise<RemovedGame | null>;
  onFailed: () => void;
  onRestored: () => void;
}) {
  const pending = remove();
  const toastId = toast(`Removed "${title}"`, {
    duration: 6000,
    action: {
      label: "Undo",
      onClick: async () => {
        try {
          // Undo can be pressed before the delete has finished.
          const snapshot = await pending;
          if (snapshot) await restoreGame(snapshot);
          onRestored();
        } catch {
          toast.error("Couldn't undo");
        }
      },
    },
  });

  pending.catch((e: unknown) => {
    toast.dismiss(toastId);
    onFailed();
    toast.error(e instanceof Error ? e.message : "Failed to remove game");
  });
}
