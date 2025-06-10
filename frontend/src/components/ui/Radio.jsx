import { forwardRef } from 'react';

const Radio = forwardRef(
  (
    {
      label,
      error,
      success,
      helperText,
      className = '',
      disabled = false,
      required = false,
      id,
      ...props
    },
    ref
  ) => {
    const radioId = id || props.name;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            disabled={disabled}
            required={required}
            className={`
              h-4 w-4
              text-primary
              border-gray-300
              focus:ring-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-300 focus:ring-red-500' : ''}
              ${success ? 'border-green-300 focus:ring-green-500' : ''}
              ${className}
            `.trim()}
            {...props}
          />
        </div>
        <div className="ml-3">
          {label && (
            <label
              htmlFor={radioId}
              className={`
                block text-sm font-medium
                ${disabled ? 'text-gray-500' : 'text-gray-700'}
                ${error ? 'text-red-600' : ''}
                ${success ? 'text-green-600' : ''}
              `.trim()}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
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
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export default Radio; 