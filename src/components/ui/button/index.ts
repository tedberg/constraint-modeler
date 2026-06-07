import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "cm:inline-flex cm:items-center cm:justify-center cm:gap-2 cm:whitespace-nowrap cm:rounded-md cm:text-sm cm:font-medium cm:ring-offset-background cm:transition-colors cm:focus-visible:outline-none cm:focus-visible:ring-2 cm:focus-visible:ring-ring cm:focus-visible:ring-offset-2 cm:disabled:pointer-events-none cm:disabled:opacity-50 cm:[&_svg]:pointer-events-none cm:[&_svg]:size-4 cm:[&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cm:bg-primary cm:text-primary-foreground cm:hover:bg-primary/90",
        destructive: "cm:bg-destructive cm:text-destructive-foreground cm:hover:bg-destructive/90",
        outline:
          "cm:border cm:border-input cm:bg-background cm:hover:bg-accent cm:hover:text-accent-foreground",
        secondary: "cm:bg-secondary cm:text-secondary-foreground cm:hover:bg-secondary/80",
        ghost: "cm:hover:bg-accent cm:hover:text-accent-foreground",
        menu: "cm:bg-transparent cm:text-cm-bar-foreground cm:hover:bg-cm-bar-foreground/10",
        link: "cm:text-primary cm:underline-offset-4 cm:hover:underline",
      },
      size: {
        default: "cm:h-10 cm:px-4 cm:py-2",
        sm: "cm:h-9 cm:rounded-md cm:px-3",
        compact: "cm:h-8 cm:px-2.5 cm:text-sm cm:rounded",
        xs: "cm:h-6 cm:px-1.5 cm:text-xs cm:rounded",
        lg: "cm:h-11 cm:rounded-md cm:px-8",
        icon: "cm:h-10 cm:w-10",
        "icon-xs": "cm:size-6 cm:rounded",
        "icon-sm": "cm:size-9",
        "icon-lg": "cm:size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
