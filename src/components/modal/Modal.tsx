// // Modal.tsx
// import React, { useEffect, ReactNode } from 'react';

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title?: string;
//   children: ReactNode;
//   size?: 'sm' | 'md' | 'lg' | 'xl';
//   showCloseButton?: boolean;
// }

// const Modal: React.FC<ModalProps> = ({
//   isOpen,
//   onClose,
//   title,
//   children,
//   size = 'md',
//   showCloseButton = true,
// }) => {
//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       document.removeEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   const sizeClasses = {
//     sm: 'max-w-md',
//     md: 'max-w-lg',
//     lg: 'max-w-2xl',
//     xl: 'max-w-4xl',
//   };

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 bg-black/60 z-40 transition-opacity"
//         onClick={onClose}
//       />
      
//       {/* Modal */}
//       <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
//         <div
//           className={`bg-white rounded-lg shadow-
//             xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-fade-in`}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           {(title || showCloseButton) && (
//             <div className="flex justify-between items-center p-4 border-b">
//               {title && (
//                 <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
//               )}
//               {showCloseButton && (
//                 <button
//                   onClick={onClose}
//                   className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
//                   aria-label="Close modal"
//                 >
//                   <svg
//                     className="w-6 h-6"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               )}
//             </div>
//           )}
          
//           {/* Body */}
//           <div className="flex-1 overflow-auto p-4">{children}</div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Modal;



// Modal.tsx
import React, { useEffect, ReactNode } from 'react';
import { Button } from '../ui/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  isConfirmLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  cancelButtonText = 'Cancel',
  confirmButtonText = 'Confirm',
  onCancel,
  onConfirm,
  isConfirmLoading = false,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-fade-in`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex justify-between items-center p-4 border-b bg-[var(--card-bg)] rounded-t-lg">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="flex-1 overflow-auto p-4 bg-[var(--card-bg-light)]">{children}</div>

          {/* Footer with Buttons */}
          <div className="border-t p-4  bg-[var(--card-bg)] rounded-b-lg">
            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                className="flex-1 bg-white border-[var(--primary-start)] hover:bg-[var(--primary-start)] text-black"
              >
                {cancelButtonText}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isConfirmLoading}
                variant="outline" className="flex-1 "
              >
                {isConfirmLoading ? 'Loading...' : confirmButtonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;