import React, { useState, useMemo, useEffect } from 'react';
import { Project, Language } from '../../types';
import { X, ExternalLink, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TRANSLATIONS } from '../../constants';

interface PortfolioProps {
  projects: Project[];
  language: Language;
  showFeaturedOnly?: boolean;
  viewAllLink?: string;
}

export const Portfolio: React.FC<PortfolioProps> = ({ 
  projects, 
  language, 
  showFeaturedOnly = false,
  viewAllLink 
}) => {
  const t = TRANSLATIONS[language].portfolio;
  const [filter, setFilter] = useState(t.all);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Extract unique categories from visible projects
  const categories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach(p => {
      if (p.visible && p.category) {
        p.category.split(',').forEach(c => cats.add(c.trim()));
      }
    });
    return [t.all, ...Array.from(cats).sort()];
  }, [projects, t.all]);

  // Reset filter if language changes
  useEffect(() => {
      setFilter(t.all);
  }, [language, t.all]);

  // Filter visible projects based on props and selection
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(p => p.visible);
    
    // Apply featured filter if requested
    if (showFeaturedOnly) {
      filtered = filtered.filter(p => p.featured);
    }

    // Apply category filter
    if (filter !== t.all) {
      filtered = filtered.filter(p => {
        const projectCats = p.category ? p.category.split(',').map(c => c.trim()) : [];
        return projectCats.includes(filter);
      });
    }
    return filtered;
  }, [projects, filter, t.all, showFeaturedOnly]);

  const isRTL = language === 'ar';

  const handleOpenModal = (project: Project) => {
    setActiveProject(project);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
        setTimeout(() => setIsVisible(true), 10);
    });
  };

  const handleCloseModal = () => {
    setIsVisible(false);
    setTimeout(() => {
      setActiveProject(null);
      document.body.style.overflow = '';
    }, 400);
  };

  return (
    <section id="work" className="py-24 scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-fade-in-up">
             <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-serif">{t.title}</h2>
             <div className="h-1.5 w-24 bg-accent rounded-full"></div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  filter === cat 
                    ? 'bg-primary border-primary text-white shadow-md' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 lg:gap-y-16">
          {filteredProjects.map((project, index) => (
            <div 
              key={project.id}
              onClick={() => handleOpenModal(project)}
              className="group cursor-pointer animate-fade-in-up flex flex-col"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] mb-5 overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/5">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                
                {/* Overlay/Action on Hover */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75 hover:bg-accent hover:text-white">
                      <Plus size={32} />
                   </div>
                </div>

                {/* Corner Tag */}
                <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                    {project.category.split(',')[0]}
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="px-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-primary mb-2 group-hover:text-accent transition-colors duration-300 leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-gray-500 text-sm font-light line-clamp-2 leading-relaxed">
                      {project.description.replace(/<[^>]+>/g, '')}
                    </p>
                  </div>
                  <div className={`mt-1 text-gray-300 group-hover:text-accent transition-colors duration-300 transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`}>
                    <ArrowUpRight size={24} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
            <p className="text-xl font-medium">{t.noProjects}</p>
          </div>
        )}

        {/* View All Button */}
        {viewAllLink && (
           <div className="mt-20 text-center animate-fade-in-up">
              <Link 
                to={viewAllLink}
                className="inline-flex items-center gap-3 bg-white hover:bg-primary border border-gray-200 hover:border-primary text-primary hover:text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 group duration-300"
              >
                <span>{language === 'en' ? 'View All Projects' : 'عرض كل المشاريع'}</span>
                <ArrowUpRight size={20} className={`transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
           </div>
        )}

        {/* Modal Overlay */}
        {activeProject && (
          <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 transition-all duration-300 ease-out ${
              isVisible ? 'bg-primary/90 backdrop-blur-md opacity-100' : 'bg-primary/0 backdrop-blur-none opacity-0'
            }`}
            onClick={handleCloseModal}
          >
            <div 
              className={`bg-white w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white text-white hover:text-primary backdrop-blur-md p-2.5 rounded-full transition-all duration-300 shadow-lg border border-white/20 group"
                aria-label="Close modal"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative group overflow-hidden">
                <img 
                  src={activeProject.imageUrl} 
                  alt={activeProject.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40"></div>
                {activeProject.externalLink && (
                  <a 
                    href={activeProject.externalLink} 
                    target={activeProject.openInNewTab !== false ? "_blank" : "_self"}
                    rel={activeProject.openInNewTab !== false ? "noopener noreferrer" : undefined}
                    className="absolute bottom-6 left-6 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium border border-white/20 transition-all flex items-center gap-2"
                  >
                    <ExternalLink size={14} /> {(t as any).openLink || "Open Link"}
                  </a>
                )}
              </div>

              <div className="w-full md:w-1/2 bg-white flex flex-col max-h-full">
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {activeProject.category.split(',').map((cat, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-1.5 bg-accent/5 text-accent text-xs font-bold uppercase tracking-widest rounded-full border border-accent/10"
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 font-serif leading-tight">
                    {activeProject.title}
                  </h2>
                  <div 
                    className="prose prose-lg prose-p:text-gray-500 prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80 leading-relaxed font-light"
                    dangerouslySetInnerHTML={{ __html: activeProject.description }}
                  />
                </div>
                {activeProject.externalLink && (
                  <div className="p-8 md:p-10 border-t border-gray-100 bg-gray-50/50">
                    <a 
                      href={activeProject.externalLink}
                      target={activeProject.openInNewTab !== false ? "_blank" : "_self"}
                      rel={activeProject.openInNewTab !== false ? "noopener noreferrer" : undefined}
                      className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-accent text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-accent/25 hover:-translate-y-1 group"
                    >
                      <span>{(t as any).visitProject || "Visit Project"}</span>
                      <ArrowUpRight size={20} className={`transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${isRTL ? 'rotate-180' : ''}`} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};