import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
    error?: boolean;
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, children, className = "", error = false }) => (
    <select
        value={value}
        onChange={e => onValueChange(e.target.value)}
        className={cn(
            "flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            error
                ? 'border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
                : 'border-input bg-transparent',
            className
        )}
    >
        {children}
    </select>
);

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
    disabled?: boolean;
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children, disabled = false }) => (
    <option value={value} disabled={disabled}>{children}</option>
);

export { Select, SelectItem };