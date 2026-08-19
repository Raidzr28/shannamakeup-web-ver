import clsx from "clsx";
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const fieldStyle =
  "w-full box-border rounded-2xl border-[1.5px] border-line-2 bg-card px-3.5 text-sm text-ink outline-none focus:border-maroon";

export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={clsx(fieldStyle, "h-[46px]", className)} {...rest} />
  );
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        fieldStyle,
        "min-h-24 resize-y py-3",
        className
      )}
      {...rest}
    />
  );
}

export function Label({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
