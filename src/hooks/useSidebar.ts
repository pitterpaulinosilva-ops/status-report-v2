import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('plan');

  // Close mobile sidebar when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when mobile sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const setSection = (section: string) => {
    setActiveSection(section);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return {
    isMobileOpen,
    activeSection,
    toggleMobile,
    setSection,
    closeMobile
  };
};

export default useSidebar;