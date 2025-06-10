const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  disabled = false,
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className={`flex items-center justify-center ${className}`.trim()}
      aria-label="Paginación"
    >
      <ul className="flex items-center -space-x-px">
        {/* Botón Anterior */}
        <li>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || disabled}
            className={`
              block px-3 py-2 ml-0 leading-tight
              rounded-l-lg border
              ${
                currentPage === 1 || disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }
            `.trim()}
          >
            <span className="sr-only">Anterior</span>
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>

        {/* Números de página */}
        {getPageNumbers().map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 border bg-white text-gray-500">
                ...
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handlePageChange(page)}
                disabled={page === currentPage || disabled}
                className={`
                  block px-3 py-2 leading-tight border
                  ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }
                  ${disabled ? 'cursor-not-allowed opacity-50' : ''}
                `.trim()}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Botón Siguiente */}
        <li>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disabled}
            className={`
              block px-3 py-2 leading-tight
              rounded-r-lg border
              ${
                currentPage === totalPages || disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }
            `.trim()}
          >
            <span className="sr-only">Siguiente</span>
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 