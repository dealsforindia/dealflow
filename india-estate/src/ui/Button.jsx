import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-accent to-emerald-600 text-white hover:opacity-90 shadow-lg shadow-accent/20",
                destructive: "bg-red-500 text-white hover:bg-red-600",
                outline: "border border-white/20 bg-transparent hover:bg-white/10 text-white",
                secondary: "bg-white/10 text-white hover:bg-white/20",
                ghost: "hover:bg-accent/10 hover:text-accent",
                link: "underline-offset-4 hover:underline text-accent",
            },
            size: {
                default: "h-11 py-2 px-6",
                sm: "h-9 px-3 rounded-lg",
                lg: "h-14 px-8 rounded-2xl text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Button = React.forwardRef(({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button, buttonVariants };
