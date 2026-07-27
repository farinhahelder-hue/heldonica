'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'danger';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastOptions = 
  | string 
  | { title?: string; description?: string; variant?: ToastType };

type ToastContextValue = {
  toast: (options: ToastOptions, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions, type?: ToastType) => {
    const id = nextId++;
    let message: string;
    let toastType: ToastType = type || 'info';
    
    if (typeof options === 'string') {
      message = options;
    } else {
      message = options.title || options.description || '';
      if (options.variant) {
        toastType = options.variant === 'danger' ? 'error' : options.variant;
      }
    }
    
    if (message) {
      setToasts(prev => [...prev, { id, message, type: toastType }]);
    }
  }, []);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const bg = toast.type === 'success' ? 'bg-green-600'
    : toast.type === 'error' ? 'bg-red-600'
    : toast.type === 'danger' ? 'bg-red-600'
    : 'bg-gray-800';

  return (
    <div className={`${bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm animate-in slide-in-from-right`}>
      <span className="flex-1">{toast.message}</span>
      <button onClick={onDone} className="text-white/70 hover:text-white">
        <X size={14} />
      </button>
    </div>
  );
}
