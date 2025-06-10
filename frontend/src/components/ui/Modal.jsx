import { Fragment } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full',
};

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  footer,
  preventClose = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (preventClose) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <Fragment>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 z-10 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className={`
              relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all
              sm:my-8 w-full ${sizes[size]} sm:max-w-full
            `.trim()}
          >
            {/* Header */}
            <div className="bg-white px-4 py-4 sm:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {title}
                </h3>
                {showClose && (
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white px-4 py-5 sm:p-6">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );

  return createPortal(modalContent, document.body);
};

// Componente para el footer estándar del modal
export const ModalFooter = ({
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  isLoading = false,
  disabled = false,
}) => {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={onCancel} disabled={isLoading || disabled}>
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        isLoading={isLoading}
        disabled={disabled}
      >
        {confirmText}
      </Button>
    </div>
  );
};

export default Modal; 