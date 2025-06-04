import React from 'react';
import { Button } from '../ui/button';

type AuthFormProps = {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  isLoading?: boolean;
  footer?: React.ReactNode;
};

export function AuthForm({
  children,
  onSubmit,
  submitText,
  isLoading = false,
  footer,
}: AuthFormProps) {
  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {submitText}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            {children}

            <div>
              <Button
                type="submit"
                variant="default"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : submitText}
              </Button>
            </div>
          </form>

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
