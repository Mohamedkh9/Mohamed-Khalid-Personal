import React from 'react';
import { PortfolioContent, Language } from '../types';
import { Navbar } from '../components/public/Navbar';
import { Footer } from '../components/public/Footer';
import { Portfolio } from '../components/public/Portfolio';
import { TRANSLATIONS } from '../constants';

interface AllProjectsPageProps {
  data: PortfolioContent;
  language: Language;
  onToggleLanguage: () => void;
}

export const AllProjectsPage: React.FC<AllProjectsPageProps> = ({ data, language, onToggleLanguage }) => {
  const t = TRANSLATIONS[language];

  // Using a simplified layout that focuses on the grid
  return (
    <div className={`min-h-screen bg-background font-sans text-text selection:bg-accent selection:text-white ${language === 'ar' ? 'font-cairo' : ''}`}>
      <Navbar 
        data={data}
        language={language}
        onToggleLanguage={onToggleLanguage}
        isHome={false}
      />

      <main className="container mx-auto px-6 md:px-12 pt-32 pb-20">
        <div className="text-center mb-16">
           <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 font-serif">
             {language === 'en' ? 'All Works' : 'كل الأعمال'}
           </h1>
           <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
             {language === 'en' 
               ? 'A complete archive of selected projects, experiments, and commercial work.' 
               : 'أرشيف كامل للمشاريع المختارة، والتجارب، والأعمال التجارية.'}
           </p>
        </div>

        {/* Display ALL visible projects */}
        <div className="-mt-12">
            <Portfolio 
                projects={data.projects} 
                language={language} 
                showFeaturedOnly={false} 
            />
        </div>
      </main>

      <Footer profile={data.profile} language={language} />
    </div>
  );
};