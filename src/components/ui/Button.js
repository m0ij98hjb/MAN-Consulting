import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = ({ className, variant = "primary", size = "md", children, as: Component = "button", ...props }) => {
  const variants = {
    primary: "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-gold",
    outline: "border-2 border-[var(--secondary)] text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
    ghost: "text-secondary hover:bg-secondary/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-bold",
  };

  // If href is provided, default to 'a' tag
  const Tag = props.href ? "a" : Component;

  return (
    <Tag
      className={cn(
        // `transition` (not `transition-all`): Tailwind's default transition
        // property list covers color/background/border/opacity/transform/shadow —
        // everything this button actually animates — without also picking up
        // unrelated properties like the global `scrollbar-color` rule in
        // globals.css, which Chrome can't run on the compositor and was
        // flagging as a non-composited animation on every button.
        "inline-flex items-center justify-center rounded-full transition duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Button;
