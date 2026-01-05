import React, { useState, useEffect, useRef } from 'react';
import { PortfolioContent, Language } from '../types';
import { Hero } from '../components/public/Hero';
import { Portfolio } from '../components/public/Portfolio';
import { Footer } from '../components/public/Footer';
import { Navbar } from '../components/public/Navbar';
import { Mail } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface PublicPageProps {
  data: PortfolioContent;
  language: Language;
  onToggleLanguage: () => void;
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="0" fill="currentColor" className="w-6 h-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const PublicPage: React.FC<PublicPageProps> = ({ data, language, onToggleLanguage }) => {
  const [activeSection, setActiveSection] = useState('home');
  const t = TRANSLATIONS[language];
  const aboutSectionRef = useRef<HTMLElement>(null);
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAboutVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (aboutSectionRef.current) observer.observe(aboutSectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 50) {
        setActiveSection('contact');
        return;
      }
      const customSectionIds = (data.customSections || [])
        .filter(s => s.visible)
        .map(s => `custom-${s.id}`);

      const sections = ['home', 'about', 'work', ...customSectionIds, 'contact'];
      const scrollPosition = window.scrollY + 100; 

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data.customSections]);

  return (
    <div className={`min-h-screen bg-background dark:bg-darkBg font-sans text-text dark:text-gray-200 selection:bg-accent selection:text-white ${language === 'ar' ? 'font-cairo' : ''}`}>
      <Navbar 
        data={data}
        language={language}
        onToggleLanguage={onToggleLanguage}
        activeSection={activeSection}
        isHome={true}
      />

      <main className="container mx-auto px-6 md:px-12 pt-20">
        <Hero profile={data.profile} language={language} />

        <section 
          id="about" 
          ref={aboutSectionRef}
          className={`py-24 border-t border-gray-200 dark:border-gray-800 scroll-mt-28 transition-all duration-1000 ease-out transform ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            <div className="space-y-10">
              <div>
                <h2 className="text-4xl font-bold text-primary dark:text-white mb-2 font-serif">{t.about.experience}</h2>
                <div className="h-1 w-16 bg-accent rounded-full"></div>
              </div>
              <div className="space-y-8 relative">
                <div className={`absolute top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800 ${language === 'ar' ? 'right-[9px]' : 'left-[9px]'}`}></div>
                {data.experiences.map(exp => (
                  <div key={exp.id} className={`relative ${language === 'ar' ? 'pr-8' : 'pl-8'}`}>
                    <div className={`absolute top-2 w-5 h-5 rounded-full border-4 border-white dark:border-darkCard bg-accent shadow-sm ${language === 'ar' ? 'right-0' : 'left-0'}`}></div>
                    <h4 className="font-bold text-xl text-primary dark:text-white">{exp.role}</h4>
                    <div className="text-sm font-medium text-accent mb-2">{exp.company} • {exp.period}</div>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
               <div>
                  <h2 className="text-4xl font-bold text-primary dark:text-white mb-2 font-serif">{t.about.education}</h2>
                  <div className="h-1 w-16 bg-accent rounded-full"></div>
               </div>
               {data.education && data.education.length > 0 ? (
                  <div className="space-y-6">
                    {data.education.map(edu => (
                      <div key={edu.id} className="bg-white dark:bg-darkCard p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-lg text-primary dark:text-white">{edu.degree}</h4>
                        <div className="text-gray-500 dark:text-gray-400 mb-2">{edu.institution}</div>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">{edu.year}</span>
                           {edu.grade && <span className="text-xs text-accent font-medium">{edu.grade}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
               ) : (
                 <p className="text-gray-400 italic">No education details added.</p>
               )}
            </div>
            
            <div className="space-y-10">
               <div>
                 <h2 className="text-4xl font-bold text-primary dark:text-white mb-2 font-serif">{t.about.skills}</h2>
                 <div className="h-1 w-12 bg-accent rounded-full"></div>
               </div>
               <div className="flex flex-col gap-6">
                 {data.skillCategories.map(cat => (
                   <div key={cat.id} className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-accent/20 dark:hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                     <h3 className="font-bold text-lg mb-4 text-primary dark:text-white flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                       {cat.name}
                     </h3>
                     <div className="flex flex-wrap gap-2">
                       {cat.skills.map((skill, idx) => (
                         <span key={idx} className="bg-gray-50 dark:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/10 hover:text-accent px-3 py-1.5 rounded-md text-xs text-gray-600 dark:text-gray-400 font-medium transition-colors border border-gray-100 dark:border-gray-700">
                           {skill}
                         </span>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </section>

        <Portfolio 
            projects={data.projects} 
            language={language} 
            showFeaturedOnly={true} 
            viewAllLink="/works" 
        />

        {(data.customSections || [])
          .filter(s => s.visible)
          .map(section => (
            <section 
              key={section.id} 
              id={`custom-${section.id}`} 
              className="py-24 border-t border-gray-200 dark:border-gray-800 scroll-mt-28"
            >
               <div className="mb-12">
                 <h2 className="text-4xl font-bold text-primary dark:text-white mb-2 font-serif">{section.title}</h2>
                 <div className="h-1 w-20 bg-accent rounded-full"></div>
               </div>
               <div className="bg-white dark:bg-darkCard p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                 <div 
                   className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed font-light"
                   dangerouslySetInnerHTML={{ __html: section.content }}
                 />
               </div>
            </section>
        ))}
        
        <section id="contact" className="py-24 border-t border-gray-200 dark:border-gray-800 scroll-mt-28">
          <div className="bg-primary dark:bg-accent/10 rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            <div className="relative z-10">
               <h2 className="text-4xl md:text-6xl font-bold mb-6 font-serif tracking-tight text-white">{t.contact.title}</h2>
               {t.contact.subtitle && (
                 <p className="text-lg md:text-xl text-white/70 dark:text-gray-400 max-w-2xl mx-auto mb-12 font-light">
                   {t.contact.subtitle}
                 </p>
               )}
               <div className={`flex flex-col md:flex-row gap-6 justify-center items-center ${!t.contact.subtitle ? 'mt-8' : ''}`}>
                 <a 
                   href="mailto:mk77285@gmail.com" 
                   className="min-w-[200px] bg-accent hover:bg-blue-600 text-white px-8 py-5 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-accent/50 hover:-translate-y-1 flex items-center justify-center gap-3"
                 >
                   <Mail size={24} />
                   {t.contact.emailBtn}
                 </a>
                 {data.profile.phone && (
                   <a 
                     href={`https://wa.me/${data.profile.phone.replace(/[^0-9]/g, '')}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="min-w-[200px] bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-5 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-green-500/50 hover:-translate-y-1 flex items-center justify-center gap-3"
                   >
                     <WhatsAppIcon />
                     <span dir="ltr">{data.profile.phone}</span>
                   </a>
                 )}
               </div>
            </div>
          </div>
        </section>
      </main>

      <Footer profile={data.profile} language={language} />
    </div>
  );
};