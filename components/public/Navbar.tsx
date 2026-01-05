import React, { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PortfolioContent, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';

interface NavbarProps {
  data: PortfolioContent;
  language: Language;
  onToggleLanguage: () => void;
  activeSection?: string;
  isHome?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  data, 
  language, 
  onToggleLanguage, 
  activeSection = '', 
  isHome = false 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();

  const navLinks = [
    { name: t.nav.home, href: '#home', id: 'home' },
    { name: t.nav.about, href: '#about', id: 'about' },
    { name: t.nav.work, href: '#work', id: 'work' },
    ...(data.customSections || [])
      .filter(s => s.visible)
      .map(s => ({ name: s.title, href: `#custom-${s.id}`, id: `custom-${s.id}` })),
    { name: t.nav.contact, href: '#contact', id: 'contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (isHome) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on another page, navigate to home and attempt to scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleLogoClick = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100/50 transition-all duration-300">
      <div className="container mx-auto px-6 md:px-12 py-5 flex justify-between items-center">
        <div 
          className="font-bold text-2xl text-primary tracking-tight cursor-pointer font-serif"
          onClick={handleLogoClick}
        >
          {data.profile.name.split(' ')[0]}<span className="text-accent text-3xl">.</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium">
          {navLinks.map((link) => (
            <a 
              key={link.id}
              href={link.href} 
              onClick={(e) => handleLinkClick(e, link.id)}
              className={`relative py-1 transition-colors duration-300 cursor-pointer tracking-wide whitespace-nowrap
                after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-accent after:transition-transform after:duration-300
                ${isHome && activeSection === link.id 
                  ? 'text-primary font-semibold after:scale-x-100' 
                  : 'text-gray-500 hover:text-primary after:scale-x-0 hover:after:scale-x-50'
                }`}
            >
              {link.name}
            </a>
          ))}
          
          <div className="w-px h-5 bg-gray-200"></div>

          <button 
            onClick={onToggleLanguage}
            className="flex items-center gap-2 text-gray-600 hover:text-accent transition-colors font-semibold"
          >
            <Globe size={18} />
            <span>{language === 'en' ? 'AR' : 'EN'}</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden">
            <button 
            onClick={onToggleLanguage}
            className="text-gray-600 hover:text-accent transition-colors font-bold text-sm"
          >
            {language === 'en' ? 'AR' : 'EN'}
          </button>
          <button 
            className="text-primary hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden bg-white border-t border-gray-100 absolute w-full transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-96 shadow-xl' : 'max-h-0'}`}>
            <div className="flex flex-col p-6 gap-2 text-base font-medium">
              {navLinks.map((link) => (
                <a 
                  key={link.id}
                  href={link.href} 
                  onClick={(e) => handleLinkClick(e, link.id)}
                  className={`px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer flex items-center justify-between
                    ${isHome && activeSection === link.id 
                      ? 'bg-accent/10 text-accent font-bold' 
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                >
                  {link.name}
                  {isHome && activeSection === link.id && <div className="w-2 h-2 rounded-full bg-accent"></div>}
                </a>
              ))}
            </div>
      </div>
    </nav>
  );
};