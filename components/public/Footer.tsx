import React from 'react';
import { Profile, Language } from '../../types';
import { Mail, Linkedin, Globe, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TRANSLATIONS } from '../../constants';

interface FooterProps {
  profile: Profile;
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ profile, language }) => {
  const t = TRANSLATIONS[language].footer;

  return (
    <footer className="bg-primary dark:bg-darkCard text-white pt-20 pb-10 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b border-white/10 pb-16 mb-10">
          <div>
            <h2 className="text-4xl font-bold mb-3 font-serif">{profile.name}</h2>
            <p className="text-white/60 text-lg">{profile.title}</p>
          </div>
          
          <div className="flex gap-4">
            {[
              { href: "mailto:mk77285@gmail.com", icon: <Mail size={22} /> },
              { href: profile.linkedin, icon: <Linkedin size={22} /> },
              { href: profile.behance, icon: <Hash size={22} /> },
              { href: profile.website, icon: <Globe size={22} /> }
            ].map((social, idx) => (
              <a 
                key={idx} 
                href={social.href} 
                target="_blank" 
                rel="noreferrer" 
                className="w-12 h-12 flex items-center justify-center bg-white/5 dark:bg-white/10 rounded-full hover:bg-accent hover:scale-110 transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/40 gap-4">
          <p>&copy; {new Date().getFullYear()} {profile.name}. {t.rights}</p>
          <div className="flex gap-6">
            <Link to="/admin" className="hover:text-white transition-colors">{t.admin}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};