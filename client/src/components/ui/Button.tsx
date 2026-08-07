import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ children, icon, className = "", variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-cyan text-ink hover:bg-white",
    ghost: "border border-line bg-white/5 text-white hover:border-cyan/70",
    danger: "border border-rose/50 bg-rose/10 text-rose hover:bg-rose hover:text-white"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
