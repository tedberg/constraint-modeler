import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Alert } from "./Alert.vue";
export { default as AlertDescription } from "./AlertDescription.vue";
export { default as AlertTitle } from "./AlertTitle.vue";

export const alertVariants = cva(
  "cm:relative cm:w-full cm:rounded-lg cm:border cm:p-4 cm:[&>svg~*]:pl-7 cm:[&>svg+div]:translate-y-[-3px] cm:[&>svg]:absolute cm:[&>svg]:left-4 cm:[&>svg]:top-4 cm:[&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "cm:bg-background cm:text-foreground",
        destructive:
          "cm:border-destructive/50 cm:text-destructive cm:dark:border-destructive cm:[&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;
