"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, useFormState } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormProps {
  children: React.ReactNode;
}

const Form = FormProvider;

interface FormFieldProps {
  name: string;
  control: any;
  render: any;
}

const FormFieldContext = React.createContext<{ name: string } | null>(null);

const FormField: React.FC<FormFieldProps> = (props) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const FormItemContext = React.createContext<{ id: string } | null>(null);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext?.name });
  const fieldState = getFieldState(fieldContext?.name || "", formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  return {
    id: itemContext?.id,
    name: fieldContext.name,
    formItemId: `${itemContext?.id}-form-item`,
    formDescriptionId: `${itemContext?.id}-form-item-description`,
    formMessageId: `${itemContext?.id}-form-item-message`,
    ...fieldState,
  };
};

interface FormComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const FormItem: React.FC<FormComponentProps> = ({ className, ...props }) => {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
};

const FormLabel: React.FC<FormComponentProps> = ({ className, ...props }) => {
  const { error, formItemId } = useFormField();
  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...(props as any)}
    />
  );
};

const FormControl: React.FC<FormComponentProps> = ({ className, ...props }) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      className={className}
      {...props}
    />
  );
};

const FormDescription: React.FC<FormComponentProps> = ({ className, ...props }) => {
  const { formDescriptionId } = useFormField();
  return <p data-slot="form-description" id={formDescriptionId} className={cn("text-muted-foreground text-sm", className)} {...props} />;
};

const FormMessage: React.FC<FormComponentProps> = ({ className, ...props }) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;
  if (!body) return null;
  return (
    <p data-slot="form-message" id={formMessageId} className={cn("text-destructive text-sm", className)} {...props}>
      {body}
    </p>
  );
};

export { Form, FormItem, FormLabel, FormControl, FormField, FormDescription, FormMessage, useFormField };
