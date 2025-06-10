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

const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      success,
      helperText,
      className = '',
      size = 'md',
      variant = 'primary',
      required = false,
      disabled = false,
      placeholder = 'Selecciona una opción',
      id,
      ...props
    },
    ref
  ) => {
    const finalVariant = error ? 'error' : success ? 'success' : variant;
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            className={`
              block w-full rounded-md shadow-sm
              appearance-none
              bg-none
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${variants[finalVariant]}
              ${sizes[size]}
              ${className}
            `.trim()}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg
              className="h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
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

Select.displayName = 'Select';

export default Select; 