
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
// Fixing error: Module '"react-router-dom"' has no exported member 'Link'.
import { Link } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: (password: string) => boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Enforce Arabic RTL for the login screen
  React.useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.body.style.fontFamily = "'Cairo', sans-serif";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(password)) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-cairo">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-10">
          <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock size={36} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">لوحة التحكم</h1>
          <p className="text-gray-500">الرجاء إدخال كلمة المرور للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-right">
            <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 transition-all text-left ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-accent/30 focus:border-accent'}`}
              placeholder="••••••••"
              dir="ltr"
            />
            {error && <p className="text-red-500 text-sm mt-2 font-medium">كلمة المرور غير صحيحة.</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            دخول
          </button>
        </form>

        <div className="text-center mt-10 border-t pt-6 border-gray-50">
          <Link to="/" className="text-sm text-gray-500 hover:text-accent font-medium transition-colors">
            &larr; العودة للموقع الرئيسي
          </Link>
        </div>
      </div>
    </div>
  );
};
