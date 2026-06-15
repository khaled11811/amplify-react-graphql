"use client";

import { useEffect, useRef } from "react";
import { useToast } from "./ToastContext";

type ActionState = { success?: boolean | string; error?: string } | undefined | null;

/**
 * Watches a `useActionState` result and shows a toast whenever the action
 * resolves with a `success` or `error` field. Skipped on initial render so
 * the toast only fires after an actual form submission.
 */
export function useActionToast(state: ActionState, successMessage = "Changes saved successfully.") {
  const { showToast } = useToast();
  const previous = useRef<ActionState>(undefined);

  useEffect(() => {
    if (state && state !== previous.current) {
      if (state.error) {
        showToast(state.error, "error");
      } else if (state.success) {
        showToast(typeof state.success === "string" ? state.success : successMessage, "success");
      }
    }
    previous.current = state;
  }, [state, showToast, successMessage]);
}
