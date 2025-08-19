import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Info, 
  AlertCircle
} from 'lucide-react';

// Modal Backdrop Component
const ModalBackdrop = ({ children, onClose, isOpen }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div 
        className="transform transition-all duration-200 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// Success Alert Component
const SuccessAlert = ({ message, isOpen, onClose, autoClose = true }) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 border-b border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-full shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-800">Success!</h3>
              <p className="text-sm text-emerald-600">Operation completed successfully</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-slate-700 mb-6 leading-relaxed">{message}</p>
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
            >
              Great!
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};

// Error Alert Component
const ErrorAlert = ({ message, isOpen, onClose }) => {
  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-red-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500 p-2 rounded-full shadow-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">Error</h3>
              <p className="text-sm text-red-600">Something went wrong</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-slate-700 mb-6 leading-relaxed">{message}</p>
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/25"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  isOpen, 
  onConfirm, 
  onCancel,
  type = "warning", // warning, danger, info
  icon
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          headerBg: 'bg-gradient-to-r from-red-50 to-red-100',
          headerBorder: 'border-red-200',
          iconBg: 'bg-red-500',
          titleColor: 'text-red-800',
          subtitleColor: 'text-red-600',
          confirmBg: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
          confirmShadow: 'hover:shadow-red-500/25'
        };
      case 'info':
        return {
          headerBg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          headerBorder: 'border-blue-200',
          iconBg: 'bg-blue-500',
          titleColor: 'text-blue-800',
          subtitleColor: 'text-blue-600',
          confirmBg: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
          confirmShadow: 'hover:shadow-blue-500/25'
        };
      default: // warning
        return {
          headerBg: 'bg-gradient-to-r from-orange-50 to-orange-100',
          headerBorder: 'border-orange-200',
          iconBg: 'bg-orange-500',
          titleColor: 'text-orange-800',
          subtitleColor: 'text-orange-600',
          confirmBg: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
          confirmShadow: 'hover:shadow-orange-500/25'
        };
    }
  };

  const styles = getTypeStyles();
  const defaultIcon = type === 'danger' ? <AlertTriangle className="h-6 w-6 text-white" /> :
                    type === 'info' ? <Info className="h-6 w-6 text-white" /> :
                    <AlertTriangle className="h-6 w-6 text-white" />;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-md w-full mx-4">
        {/* Header */}
        <div className={`${styles.headerBg} p-6 border-b ${styles.headerBorder}`}>
          <div className="flex items-center space-x-3">
            <div className={`${styles.iconBg} p-2 rounded-full shadow-lg`}>
              {icon || defaultIcon}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${styles.titleColor}`}>{title}</h3>
              <p className={`text-sm ${styles.subtitleColor}`}>Please confirm your action</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-slate-700 mb-6 leading-relaxed">{message}</p>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 ${styles.confirmBg} text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${styles.confirmShadow}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};

// Loading Dialog Component
const LoadingDialog = ({ message = "Processing...", isOpen }) => {
  return (
    <ModalBackdrop isOpen={isOpen}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-sm w-full mx-4">
        <div className="p-8 text-center">
          <div className="bg-blue-500 p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{message}</h3>
          <p className="text-sm text-slate-600">Please wait while we process your request</p>
        </div>
      </div>
    </ModalBackdrop>
  );
};

// Custom Hook for UI Dialogs
export const useUIDialogs = () => {
  const [dialogs, setDialogs] = useState({
    success: { isOpen: false, message: '' },
    error: { isOpen: false, message: '' },
    confirm: { isOpen: false, title: '', message: '', onConfirm: null, onCancel: null, type: 'warning', icon: null },
    loading: { isOpen: false, message: 'Processing...' }
  });

  const showSuccess = (message, autoClose = true) => {
    setDialogs(prev => ({
      ...prev,
      success: { isOpen: true, message, autoClose }
    }));
  };

  const showError = (message) => {
    setDialogs(prev => ({
      ...prev,
      error: { isOpen: true, message }
    }));
  };

  const showConfirm = (title, message, options = {}) => {
    return new Promise((resolve) => {
      setDialogs(prev => ({
        ...prev,
        confirm: {
          isOpen: true,
          title,
          message,
          type: options.type || 'warning',
          icon: options.icon,
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          onConfirm: () => {
            setDialogs(prev => ({
              ...prev,
              confirm: { ...prev.confirm, isOpen: false }
            }));
            resolve(true);
          },
          onCancel: () => {
            setDialogs(prev => ({
              ...prev,
              confirm: { ...prev.confirm, isOpen: false }
            }));
            resolve(false);
          }
        }
      }));
    });
  };

  const showLoading = (message = "Processing...") => {
    setDialogs(prev => ({
      ...prev,
      loading: { isOpen: true, message }
    }));
  };

  const hideLoading = () => {
    setDialogs(prev => ({
      ...prev,
      loading: { isOpen: false, message: 'Processing...' }
    }));
  };

  const closeSuccess = () => {
    setDialogs(prev => ({
      ...prev,
      success: { isOpen: false, message: '' }
    }));
  };

  const closeError = () => {
    setDialogs(prev => ({
      ...prev,
      error: { isOpen: false, message: '' }
    }));
  };

  return {
    showSuccess,
    showError,
    showConfirm,
    showLoading,
    hideLoading,
    dialogs,
    closeSuccess,
    closeError,
    // Dialog Components for rendering
    DialogComponents: () => (
      <>
        <SuccessAlert 
          message={dialogs.success.message}
          isOpen={dialogs.success.isOpen}
          onClose={closeSuccess}
          autoClose={dialogs.success.autoClose}
        />
        
        <ErrorAlert 
          message={dialogs.error.message}
          isOpen={dialogs.error.isOpen}
          onClose={closeError}
        />
        
        <ConfirmationDialog
          title={dialogs.confirm.title}
          message={dialogs.confirm.message}
          isOpen={dialogs.confirm.isOpen}
          onConfirm={dialogs.confirm.onConfirm}
          onCancel={dialogs.confirm.onCancel}
          type={dialogs.confirm.type}
          icon={dialogs.confirm.icon}
          confirmText={dialogs.confirm.confirmText}
          cancelText={dialogs.confirm.cancelText}
        />
        
        <LoadingDialog
          message={dialogs.loading.message}
          isOpen={dialogs.loading.isOpen}
        />
      </>
    )
  };
};