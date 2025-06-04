import { z } from 'zod';

// Define the field styles schema
export const FieldStyleSchema = z.object({
  labelFontSize: z.string().optional(),
  labelFontWeight: z.string().optional(),
  labelColor: z.string().optional(),
  inputBorderColor: z.string().optional(),
  inputBorderWidth: z.string().optional(),
  inputBorderRadius: z.string().optional(),
  inputBackgroundColor: z.string().optional(),
  inputTextColor: z.string().optional(),
  inputPadding: z.string().optional(),
  inputFontSize: z.string().optional(),
  width: z.string().optional(),
  marginBottom: z.string().optional(),
});

// Define the form field schema
export const FormFieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  required: z.boolean().optional().default(false),
  options: z.array(z.string()).optional(),
  styles: FieldStyleSchema.optional(),
  validation: z.object({
    type: z.string().optional(),
    message: z.string().optional(),
    pattern: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
});

// Define the button style schema
export const ButtonStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  hoverColor: z.string().optional(),
  textColor: z.string().optional(),
  borderRadius: z.string().optional(),
  padding: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  width: z.string().optional(),
  boxShadow: z.string().optional(),
  alignment: z.string().optional(),
});

// Define the form style schema
export const FormStyleSchema = z.object({
  // Form container styles
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.string().optional(),
  borderRadius: z.string().optional(),
  padding: z.string().optional(),
  maxWidth: z.string().optional(),
  boxShadow: z.string().optional(),
  
  // Title styles
  titleFontSize: z.string().optional(),
  titleFontWeight: z.string().optional(),
  titleColor: z.string().optional(),
  
  // Description styles
  descriptionColor: z.string().optional(),
  descriptionFontSize: z.string().optional(),
  
  // Input field styles
  inputBorderColor: z.string().optional(),
  inputBorderWidth: z.string().optional(),
  inputBorderRadius: z.string().optional(),
  inputBackgroundColor: z.string().optional(),
  inputTextColor: z.string().optional(),
  inputPadding: z.string().optional(),
  inputFontSize: z.string().optional(),
  width: z.string().optional(),
  marginBottom: z.string().optional(),
  
  // Label styles
  labelFontSize: z.string().optional(),
  labelFontWeight: z.string().optional(),
  labelColor: z.string().optional(),
});

// Define the form schema
export const FormSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  styles: FormStyleSchema.optional(),
  buttonStyle: ButtonStyleSchema.optional(),
  submitText: z.string().optional(),
  successMessage: z.string().optional(),
  redirectUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  tenantId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  embedCode: z.string().optional(),
});

// Define the form submission schema
export const FormSubmissionSchema = z.object({
  id: z.string().optional(),
  formId: z.string(),
  data: z.record(z.any()),
  contactId: z.string().optional(),
  createdAt: z.date().optional(),
  tenantId: z.string(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
});

export type FieldStyle = z.infer<typeof FieldStyleSchema>;
export type FormField = z.infer<typeof FormFieldSchema>;
export type ButtonStyle = z.infer<typeof ButtonStyleSchema>;
export type FormStyle = z.infer<typeof FormStyleSchema>;
export type Form = z.infer<typeof FormSchema>;
export type FormSubmission = z.infer<typeof FormSubmissionSchema>;
