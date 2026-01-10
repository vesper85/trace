"use client";

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    info: "group-[.toaster]:bg-blue-950/50 group-[.toaster]:border-blue-500/30 group-[.toaster]:text-blue-100",
                    success: "group-[.toaster]:bg-green-950/50 group-[.toaster]:border-green-500/30 group-[.toaster]:text-green-100",
                    warning: "group-[.toaster]:bg-yellow-950/50 group-[.toaster]:border-yellow-500/30 group-[.toaster]:text-yellow-100",
                    error: "group-[.toaster]:bg-red-950/50 group-[.toaster]:border-red-500/30 group-[.toaster]:text-red-100",
                },
            }}
            {...props}
        />
    );
};

export { Toaster, toast };
