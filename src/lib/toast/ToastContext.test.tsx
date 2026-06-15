import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./ToastContext";

function TriggerButton({ message, type }: { message: string; type?: "success" | "error" }) {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast(message, type)}>{"trigger"}</button>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a green success toast", async () => {
    render(
      <ToastProvider>
        <TriggerButton message="Changes saved successfully." type="success" />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByText("trigger").click();
    });

    const toast = screen.getByTestId("toast");
    expect(toast).toHaveTextContent("Changes saved successfully.");
    expect(toast).toHaveAttribute("data-type", "success");
    expect(toast.className).toContain("bg-green-100/90");
  });

  it("shows a red error toast", async () => {
    render(
      <ToastProvider>
        <TriggerButton message="Payment failed." type="error" />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByText("trigger").click();
    });

    const toast = screen.getByTestId("toast");
    expect(toast).toHaveTextContent("Payment failed.");
    expect(toast).toHaveAttribute("data-type", "error");
    expect(toast.className).toContain("bg-red-100/90");
  });

  it("defaults to a success toast when no type is given", async () => {
    render(
      <ToastProvider>
        <TriggerButton message="Saved." />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByText("trigger").click();
    });

    expect(screen.getByTestId("toast")).toHaveAttribute("data-type", "success");
  });

  it("starts the fade-out animation after 5 seconds and removes the toast shortly after", async () => {
    render(
      <ToastProvider>
        <TriggerButton message="Saved." type="success" />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByText("trigger").click();
    });

    expect(screen.getByTestId("toast").className).toContain("animate-toast-in");

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId("toast").className).toContain("animate-toast-out");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByTestId("toast")).not.toBeInTheDocument();
  });

  it("can show multiple toasts at once", async () => {
    render(
      <ToastProvider>
        <TriggerButton message="First" type="success" />
        <TriggerButton message="Second" type="error" />
      </ToastProvider>
    );

    const buttons = screen.getAllByText("trigger");

    await act(async () => {
      buttons[0].click();
      buttons[1].click();
    });

    const toasts = screen.getAllByTestId("toast");
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveTextContent("First");
    expect(toasts[1]).toHaveTextContent("Second");
  });

  it("throws when useToast is used outside of a provider", () => {
    function Bare() {
      useToast();
      return null;
    }

    expect(() => render(<Bare />)).toThrow(/useToast must be used within a ToastProvider/);
  });
});

describe("ToastProvider with real timers", () => {
  it("fades the toast out and away after roughly 5 seconds", async () => {
    render(
      <ToastProvider>
        <TriggerButton message="Saved." type="success" />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByText("trigger").click();
    });

    expect(screen.getByTestId("toast")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByTestId("toast")).not.toBeInTheDocument();
      },
      { timeout: 7000 }
    );
  }, 10000);
});
