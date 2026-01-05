import React from 'react';
import { Profile, Language } from '../../types';
import { FileText } from 'lucide-react';
import { TRANSLATIONS } from '../../constants';

interface HeroProps {
  profile: Profile;
  language: Language;
}

const HEART_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23ec4899' stroke='white' stroke-width='2'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/></svg>") 16 16, auto`;

export const Hero: React.FC<HeroProps> = ({ profile, language }) => {
  const t = TRANSLATIONS[language].hero;
  
  const nameParts = profile.name.split(' ');
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(' ') || "";

  return (
    <section id="home" className="min-h-[85vh] flex flex-col justify-center items-center pt-28 pb-10 scroll-mt-28">
      <div className="w-full max-w-7xl px-4 animate-fade-in-up">
        <div className="border-2 border-accent p-6 md:p-12 lg:p-16 relative bg-white/30 dark:bg-white/5 backdrop-blur-sm rounded-none md:rounded-lg mx-auto max-w-6xl transition-all hover:shadow-lg dark:border-accent/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-start">
               <h1 className="font-serif text-primary dark:text-white leading-[1.1] mb-8">
                 <span className="block text-4xl md:text-5xl mb-2 font-medium opacity-90 dark:text-gray-300">{t.hello}</span>
                 <div className="flex flex-col md:flex-row items-center lg:items-start justify-center lg:justify-start gap-2 md:gap-3 flex-wrap">
                    <a href="mailto:mk77285@gmail.com" className="block text-5xl md:text-7xl lg:text-8xl font-bold hover:text-accent transition-colors">
                      {firstName}
                    </a>
                    {lastName && (
                      <span className="block text-5xl md:text-7xl lg:text-8xl font-bold text-primary dark:text-white">
                        <span className="text-accent text-5xl md:text-7xl lg:text-8xl">.</span>{lastName}
                      </span>
                    )}
                 </div>
               </h1>
               <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 w-full max-w-lg leading-relaxed font-light">
                 {profile.bio}
               </p>
               <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                 <a 
                   href="#"
                   className="group border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-accent text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 bg-white dark:bg-gray-800"
                 >
                   {t.downloadCV} <FileText size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                 </a>
               </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative group">
                <div className="w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] relative z-10">
                   <img 
                     src={profile.avatarUrl || "https://placehold.co/600x600/1C2A4A/FFFFFF?text=MK"} 
                     alt={profile.name}
                     className="w-full h-full object-cover rounded-full lg:rounded-[3rem] shadow-2xl border-4 border-white dark:border-gray-800 grayscale hover:grayscale-0 transition-all duration-500"
                     style={{ cursor: HEART_CURSOR }}
                   />
                </div>
                <div className="absolute top-10 -right-10 w-full h-full border-2 border-accent rounded-full lg:rounded-[3rem] -z-0 hidden lg:block opacity-30"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};