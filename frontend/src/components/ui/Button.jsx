import { forwardRef } from 'react';
import Spinner from './Spinner';

const variants = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
  secondary:
    'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  success:
    'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  danger:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  warning:
    'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
  info: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
  light:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500',
  dark: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500',
  link: 'bg-transparent text-primary-500 hover:underline focus:ring-primary-500',
  outline:
    'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2 text-lg',
  xl: 'px-6 py-3 text-xl',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center
          font-medium rounded-md
          focus:outline-none focus:ring-2 focus:ring-offset-2
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `.trim()}
        {...props}
      >
        {isLoading && (
          <Spinner
            size="sm"
            variant={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'}
            className="mr-2"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 