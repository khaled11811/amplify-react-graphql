import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToastProvider } from "./ToastContext";
import { useActionToast } from "./useActionToast";

type ActionState = { success?: boolean; error?: string } | undefined;

function FormStub({ state }: { state: ActionState }) {
  useActionToast(state, "Saved successfully.");
  return null;
}

describe("useActionToast", () => {
  it("does not show a toast on initial render", () => {
    render(
      <ToastProvider>
        <FormStub state={undefined} />
      </ToastProvider>
    );

    expect(screen.queryByTestId("toast")).not.toBeInTheDocument();
  });

  it("shows a green success toast when the action state has success", () => {
    const { rerender } = render(
      <ToastProvider>
        <FormStub state={undefined} />
      </ToastProvider>
    );

    act(() => {
      rerender(
        <ToastProvider>
          <FormStub state={{ success: true }} />
        </ToastProvider>
      );
    });

    const toast = screen.getByTestId("toast");
    expect(toast).toHaveAttribute("data-type", "success");
    expect(toast).toHaveTextContent("Saved successfully.");
  });

  it("shows a red error toast when the action state has an error", () => {
    const { rerender } = render(
      <ToastProvider>
        <FormStub state={undefined} />
      </ToastProvider>
    );

    act(() => {
      rerender(
        <ToastProvider>
          <FormStub state={{ error: "Missing required fields." }} />
        </ToastProvider>
      );
    });

    const toast = screen.getByTestId("toast");
    expect(toast).toHaveAttribute("data-type", "error");
    expect(toast).toHaveTextContent("Missing required fields.");
  });
});
