import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicPage } from './pages/PublicPage';
import { AllProjectsPage } from './pages/AllProjectsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { PortfolioData, Language } from './types';
import { INITIAL_DATA, ADMIN_PASSWORD } from './constants';

// وظيفة لدمج البيانات المحفوظة مع البيانات الجديدة في الكود
// هذا يضمن عدم فقدان بيانات المستخدم عند إضافة حقول جديدة في التحديثات
const deepMerge = (target: any, source: any): any => {
  if (typeof target !== 'object' || target === null) {
    return source !== undefined ? source : target;
  }
  
  if (Array.isArray(target)) {
    // في حالة المصفوفات (مثل المشاريع)، نفضل البيانات المحفوظة (المصدر) إذا وجدت
    // لأن المستخدم قد يكون رتبها أو حذف منها
    return Array.isArray(source) ? source : target;
  }

  const output = { ...target };
  if (typeof source === 'object' && source !== null) {
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && source[key] !== null && key in target) {
        if (Array.isArray(source[key])) {
           output[key] = source[key];
        } else {
           output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
};

const App: React.FC = () => {
  // استخدام مفتاح تخزين ثابت لإصدار البيانات الحالي
  const STORAGE_KEY = 'creative_portfolio_data_v1.0';

  const [data, setData] = useState<PortfolioData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        // ندمج البيانات المحفوظة فوق البيانات الأولية
        // INITIAL_DATA هو الأساس (يحتوي على الحقول الجديدة)
        // parsedSaved هو التغييرات (يملأ القيم)
        return deepMerge(INITIAL_DATA, parsedSaved);
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
    return INITIAL_DATA;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_token') === 'true';
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'ar';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.style.fontFamily = language === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif";
    localStorage.setItem('app_language', language);
  }, [language]);

  // حفظ البيانات فورياً عند حدوث أي تعديل
  const handleUpdateData = (newData: PortfolioData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicPage data={data[language]} language={language} onToggleLanguage={toggleLanguage} />} />
        <Route path="/works" element={<AllProjectsPage data={data[language]} language={language} onToggleLanguage={toggleLanguage} />} />
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