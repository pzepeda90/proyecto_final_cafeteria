const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        bg-white
        rounded-lg
        shadow-sm
        border border-gray-200
        overflow-hidden
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        px-6 py-4
        border-b border-gray-200
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        px-6 py-4
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        px-6 py-4
        border-t border-gray-200
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 