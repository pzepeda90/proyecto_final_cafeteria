import { forwardRef } from 'react';

const variants = {
  primary: 'border-gray-300 focus:border-primary focus:ring-primary',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
};

const sizes = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-2 text-lg',
};

const Input = forwardRef(
  (
    {
      type = 'text',
      label,
      error,
      success,
      helperText,
      className = '',
      size = 'md',
      variant = 'primary',
      required = false,
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    // Si hay error, forzar variante de error
    const finalVariant = error ? 'error' : success ? 'success' : variant;
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={type}
            id={inputId}
            disabled={disabled}
            required={required}
            className={`
              block w-full rounded-md shadow-sm
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${variants[finalVariant]}
              ${sizes[size]}
              ${className}
            `.trim()}
            {...props}
          />
        </div>
        {(error || helperText || success) && (
          <p
            className={`mt-1 text-sm ${
              error
                ? 'text-red-600'
                : success
                ? 'text-green-600'
                : 'text-gray-500'
            }`}
          >
            {error || helperText || success}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 