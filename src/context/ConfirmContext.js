'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const ConfirmContext = createContext(null);

// Drop-in, promise-based replacements for window.confirm()/window.alert() that
// render as a themed modal instead of the native browser dialog. Mounted once
// at the admin layout root; any admin page/component can call useConfirm().
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((message, options = {}) => (
    new Promise((resolve) => {
      setDialog({ mode: 'confirm', message, resolve, ...options });
    })
  ), []);

  const alert = useCallback((message, options = {}) => (
    new Promise((resolve) => {
      setDialog({ mode: 'alert', message, resolve, ...options });
    })
  ), []);

  const close = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog && (
        <ConfirmDialog
          {...dialog}
          onCancel={() => close(false)}
          onConfirm={() => close(true)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
