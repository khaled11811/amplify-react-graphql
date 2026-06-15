"use client";

import { useEffect } from "react";
import { useToast, type ToastType } from "./ToastContext";

/**
 * Shows a toast once when `?<param>=1` is present in the URL (used after a
 * server action redirects back with a success/error marker), then strips the
 * param from the URL so the toast doesn't reappear on refresh/back.
 *
 * Reads `window.location` directly (rather than `useSearchParams`) so this
 * component never needs a Suspense boundary.
 */
export function QueryToast({
  param,
  message,
  type = "success",
}: {
  param: string;
  message: string;
  type?: ToastType;
}) {
  const { showToast } = useToast();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get(param) !== "1") return;

    showToast(message, type);

    url.searchParams.delete(param);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
