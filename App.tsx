import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicPage } from './pages/PublicPage';
import { AllProjectsPage } from './pages/AllProjectsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { PortfolioData, Language } from './types';
import { INITIAL_DATA, ADMIN_PASSWORD } from './constants';

const App: React.FC = () => {
  // State for data persistence
  const [data, setData] = useState<PortfolioData>(() => {
    const saved = localStorage.getItem('portfolio_data_v2');
    if (saved) {
      return JSON.parse(saved);
    }
    // Attempt migration from v1 (single object) to v2 (dual object)
    const oldSaved = localStorage.getItem('portfolio_data');
    if (oldSaved) {
      const oldData = JSON.parse(oldSaved);
      // If the old data looks like it has 'profile', it's v1. 
      // We will use it for EN and copy structure for AR
      if (oldData.profile) {
        return {
          en: oldData,
          ar: { ...oldData, profile: { ...oldData.profile, name: "محمد خالد", title: "مصمم جرافيك", bio: "يرجى تحديث السيرة الذاتية بالعربية من لوحة التحكم." } }
        };
      }
    }
    return INITIAL_DATA;
  });

  // State for authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_token') === 'true';
  });

  // State for language
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'en';
  });

  // Effect to handle Document direction based on language
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.style.fontFamily = language === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif";
    localStorage.setItem('app_language', language);
  }, [language]);

  // Persist data whenever it changes
  useEffect(() => {
    localStorage.setItem('portfolio_data_v2', JSON.stringify(data));
  }, [data]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const handleLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('auth_token', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
  };

  const handleUpdateData = (newData: PortfolioData) => {
    setData(newData);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicPage 
              data={data[language]} 
              language={language} 
              onToggleLanguage={toggleLanguage} 
            />
          } 
        />
        <Route 
          path="/works" 
          element={
            <AllProjectsPage 
              data={data[language]} 
              language={language} 
              onToggleLanguage={toggleLanguage} 
            />
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAuthenticated ? (
              <AdminDashboard 
                data={data} 
                onUpdate={handleUpdateData} 
                onLogout={handleLogout} 
              />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;