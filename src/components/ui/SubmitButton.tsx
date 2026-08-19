"use client";
import { useFormStatus } from "react-dom";
import clsx from "clsx";

/** A submit button that disables itself while its form is in flight.
 *
 * `useFormStatus` reads the state of the nearest enclosing form, which is why
 * this has to be its own component rendered *inside* the form rather than the
 * thing that renders the form.
 *
 * This is the guard against a double-tap sending two requests. The server
 * actions are written to be safe about it anyway — the reservation
 * transitions match on the current status, so a second click is a no-op rather
 * than a rewind — but a button that visibly does nothing on the first press is
 * what makes people press it again. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  disabled,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  /** Shown in place of the label while the action runs. Omit to keep the
   * label and just dim the control — right for icon-sized buttons. */
  pendingLabel?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      aria-label={ariaLabel}
      className={clsx(
        className,
        "disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
      )}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
