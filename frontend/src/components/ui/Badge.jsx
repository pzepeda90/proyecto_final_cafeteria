const variants = {
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <span
      className={\`
        inline-flex items-center justify-center
        font-medium rounded-full
        \${variants[variant]}
        \${sizes[size]}
        \${className}
      \`.trim()}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge; 