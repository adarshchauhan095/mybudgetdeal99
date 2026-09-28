import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings, Product } from '../types';
import { getSiteSettings, saveSiteSettings as persistSettings } from '../services/catalogService';
import { initialSiteSettings } from '../data/seedData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SiteContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  formatPrice: (amount?: number, currency?: string) => string;
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  const updateSettings = async (newSettings: SiteSettings) => {
    await persistSettings(newSettings);
    setSettings(newSettings);
    showToast('Site settings updated successfully!', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const formatPrice = (amount?: number, currency = settings.defaultCurrency) => {
    if (amount === undefined || amount === null) return '';
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <SiteContext.Provider
      value={{
        settings,
        updateSettings,
        formatPrice,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        showToast,
        removeToast,
        searchOpen,
        setSearchOpen
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within a SiteProvider');
  return ctx;
};
