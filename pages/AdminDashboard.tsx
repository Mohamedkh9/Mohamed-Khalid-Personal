import React, { useState, useEffect, useMemo } from 'react';
import { PortfolioData, PortfolioContent, Project, Experience, Education, CustomSection, Language, SkillCategory } from '../types';
import { LogOut, LayoutDashboard, Briefcase, User, Layers, Plus, Trash2, GripVertical, Image as ImageIcon, GraduationCap, ChevronUp, ChevronDown, FileText, Link as LinkIcon, ExternalLink, Globe, LayoutTemplate, Save, CheckCircle, Camera, Menu, X, Star, AlertTriangle, Eye, Tag, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RichTextEditor } from '../components/admin/RichTextEditor';
import { ai } from '../lib/gemini';

interface AdminDashboardProps {
  data: PortfolioData;
  onUpdate: (newData: PortfolioData) => void;
  onLogout: () => void;
}

const isValidUrl = (urlString: string) => {
  if (!urlString) return true;
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1200;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/webp', 0.8));
        } else {
            reject(new Error("Canvas context failed"));
        }
      };
    };
  });
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdate, onLogout }) => {
  const [localData, setLocalData] = useState<PortfolioData>(data);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'skills' | 'experience' | 'education' | 'custom'>('profile');
  const [editingLanguage, setEditingLanguage] = useState<Language>('ar');
  
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name?: string } | null>(null);
  
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.body.style.fontFamily = "'Cairo', sans-serif";
  }, []);

  // Sync localData if parent data changes (fixing potential revert issues on reload if App updates)
  useEffect(() => {
      // Only update if we don't have unsaved changes to prevent overwriting user work
      if (!hasUnsavedChanges) {
          setLocalData(data);
      }
  }, [data, hasUnsavedChanges]);

  const currentContent: PortfolioContent = localData[editingLanguage];

  const updateLocal = (newContent: PortfolioContent) => {
    setLocalData(prev => ({ ...prev, [editingLanguage]: newContent }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onUpdate(localData);
    setHasUnsavedChanges(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const initiateDelete = (type: string, id: string, name: string = '') => {
    setDeleteTarget({ type, id, name });
  };

  const executeDelete = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const filter = (items: any[]) => items.filter(i => i.id !== id);
    
    setLocalData(prev => {
      const next = { ...prev };
      if (type === 'project') { next.en.projects = filter(next.en.projects); next.ar.projects = filter(next.ar.projects); }
      else if (type === 'skill') { next.en.skillCategories = filter(next.en.skillCategories); next.ar.skillCategories = filter(next.ar.skillCategories); }
      else if (type === 'experience') { next.en.experiences = filter(next.en.experiences); next.ar.experiences = filter(next.ar.experiences); }
      else if (type === 'education') { next.en.education = filter(next.en.education); next.ar.education = filter(next.ar.education); }
      else if (type === 'custom') { next.en.customSections = filter(next.en.customSections); next.ar.customSections = filter(next.ar.customSections); }
      return next;
    });
    setHasUnsavedChanges(true);
    setDeleteTarget(null);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateLocal({
        ...currentContent,
        profile: { ...currentContent.profile, [name]: value }
    });
  };

  const handleProjectImageUpload = async (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsCompressing(true);
        try {
            const url = await compressImage(file);
            const updateProjectList = (projects: Project[]) => projects.map(p => p.id === projectId ? { ...p, imageUrl: url } : p);
            setLocalData(prev => ({
                en: { ...prev.en, projects: updateProjectList(prev.en.projects) },
                ar: { ...prev.ar, projects: updateProjectList(prev.ar.projects) }
            }));
            setHasUnsavedChanges(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCompressing(false);
        }
    }
  };

  const handleAddTag = (projectId: string, tag: string) => {
    if (!tag.trim()) return;
    const cleanTag = tag.trim();
    const updateProjectList = (projects: Project[]) => projects.map(p => {
        if (p.id === projectId) {
            const currentTags = p.tags || [];
            if (!currentTags.includes(cleanTag)) {
                return { ...p, tags: [...currentTags, cleanTag] };
            }
        }
        return p;
    });
    setLocalData(prev => ({
        en: { ...prev.en, projects: updateProjectList(prev.en.projects) },
        ar: { ...prev.ar, projects: updateProjectList(prev.ar.projects) }
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveTag = (projectId: string, tagToRemove: string) => {
    const updateProjectList = (projects: Project[]) => projects.map(p => {
        if (p.id === projectId) {
            return { ...p, tags: (p.tags || []).filter(t => t !== tagToRemove) };
        }
        return p;
    });
    setLocalData(prev => ({
        en: { ...prev.en, projects: updateProjectList(prev.en.projects) },
        ar: { ...prev.ar, projects: updateProjectList(prev.ar.projects) }
    }));
    setHasUnsavedChanges(true);
  };

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    try {
        const prompt = `Write a professional, creative, and concise bio (max 80 words) for a portfolio.
        Name: ${currentContent.profile.name}
        Job Title: ${currentContent.profile.title}
        Key Skills: ${currentContent.skillCategories.flatMap(c => c.skills).join(', ')}
        Language: ${editingLanguage === 'ar' ? 'Arabic' : 'English'}
        Tone: Professional yet approachable.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        if (response.text) {
             updateLocal({
                ...currentContent,
                profile: { ...currentContent.profile, bio: response.text }
            });
        }
    } catch (error) {
        console.error("AI Error:", error);
        alert("Failed to generate bio. Please check your API Key configuration.");
    } finally {
        setIsGeneratingBio(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-cairo" dir="rtl">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 transform ${showSaveSuccess ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-white dark:bg-darkCard border border-green-200 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
             <CheckCircle size={24} />
           </div>
           <div>
             <h4 className="font-bold text-gray-900 dark:text-white">تم حفظ التغييرات</h4>
             <p className="text-sm text-gray-500">تم تحديث بيانات موقعك بنجاح</p>
           </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-[#1e293b] text-white z-50 transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:static flex flex-col`}>
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <h1 className="text-2xl font-bold">لوحة <span className="text-blue-400">التحكم</span></h1>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'profile', label: 'البيانات الشخصية', icon: User },
            { id: 'projects', label: 'المشاريع', icon: ImageIcon },
            { id: 'skills', label: 'المهارات', icon: Layers },
            { id: 'experience', label: 'الخبرة', icon: Briefcase },
            { id: 'education', label: 'التعليم', icon: GraduationCap },
            { id: 'custom', label: 'أقسام مخصصة', icon: LayoutTemplate }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={18} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm sticky top-0 z-30 border">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu /></button>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setEditingLanguage('ar')} className={`px-4 py-2 rounded-lg text-sm font-bold ${editingLanguage === 'ar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>العربية</button>
              <button onClick={() => setEditingLanguage('en')} className={`px-4 py-2 rounded-lg text-sm font-bold ${editingLanguage === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>English</button>
            </div>
            {isCompressing && <span className="text-sm text-blue-500 animate-pulse">جاري معالجة الصورة...</span>}
          </div>
          <div className="flex items-center gap-3">
             <Link 
              to="/" 
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
             >
                <Eye size={20} />
                <span className="hidden md:inline">معاينة الموقع</span>
             </Link>
             <button 
                onClick={handleSave} 
                className={`flex items-center gap-2 px-10 py-3 rounded-xl font-bold text-white transition-all ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' : 'bg-gray-300 cursor-not-allowed'}`}
                disabled={!hasUnsavedChanges}
             >
                <Save size={20} /> حفظ التعديلات
             </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto">
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <img src={currentContent.profile.avatarUrl} className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-lg" />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                    <Camera />
                    <input type="file" className="hidden" accept="image/*" onChange={async e => {
                      const file = e.target.files?.[0];
                      if(file) {
                        const url = await compressImage(file);
                        setLocalData(prev => ({
                          en: { ...prev.en, profile: { ...prev.en.profile, avatarUrl: url } },
                          ar: { ...prev.ar, profile: { ...prev.ar.profile, avatarUrl: url } }
                        }));
                        setHasUnsavedChanges(true);
                      }
                    }} />
                  </label>
                </div>
                <div className="flex-1 w-full space-y-4">
                  <input value={currentContent.profile.name} onChange={e => updateLocal({...currentContent, profile: {...currentContent.profile, name: e.target.value}})} className="text-3xl font-bold w-full border-b focus:border-blue-500 outline-none p-2" placeholder="الاسم" />
                  <input value={currentContent.profile.title} onChange={e => updateLocal({...currentContent, profile: {...currentContent.profile, title: e.target.value}})} className="text-xl text-blue-600 w-full border-b focus:border-blue-500 outline-none p-2" placeholder="المسمى الوظيفي" />
                </div>
              </div>
              
              <div className="relative">
                <textarea 
                  value={currentContent.profile.bio} 
                  onChange={e => updateLocal({...currentContent, profile: {...currentContent.profile, bio: e.target.value}})} 
                  className="w-full p-4 border rounded-2xl min-h-[150px] outline-none focus:ring-2 focus:ring-blue-500 pb-12" 
                  placeholder="نبذة عنك" 
                />
                <button 
                    onClick={handleGenerateBio}
                    disabled={isGeneratingBio}
                    className="absolute bottom-3 left-3 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
                    title="Generate Bio with AI (Gemini)"
                >
                    <Wand2 size={14} className={isGeneratingBio ? "animate-spin" : ""} />
                    {isGeneratingBio ? "جاري الكتابة..." : "كتابة تلقائية (AI)"}
                </button>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700"><LinkIcon size={18}/> روابط التواصل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">البريد الإلكتروني</label>
                    <input type="email" name="email" value={currentContent.profile.email} onChange={handleProfileChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">رقم الهاتف</label>
                    <input type="text" name="phone" value={currentContent.profile.phone} onChange={handleProfileChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">LinkedIn</label>
                    <input type="url" name="linkedin" value={currentContent.profile.linkedin} onChange={handleProfileChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">Behance</label>
                    <input 
                      type="url" 
                      name="behance" 
                      value={currentContent.profile.behance} 
                      onChange={handleProfileChange} 
                      className={`w-full p-3 border rounded-xl outline-none focus:border-blue-500 ${!isValidUrl(currentContent.profile.behance) && currentContent.profile.behance ? 'border-red-300 bg-red-50' : ''}`} 
                      dir="ltr" 
                      placeholder="https://behance.net/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">الموقع الشخصي (Website)</label>
                    <input 
                      type="url" 
                      name="website" 
                      value={currentContent.profile.website} 
                      onChange={handleProfileChange} 
                      className={`w-full p-3 border rounded-xl outline-none focus:border-blue-500 ${!isValidUrl(currentContent.profile.website) && currentContent.profile.website ? 'border-red-300 bg-red-50' : ''}`} 
                      dir="ltr" 
                      placeholder="https://..."
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">رابط الأعمال الخارجي (External Portfolio)</label>
                    <input 
                      type="url" 
                      name="externalPortfolioUrl" 
                      value={currentContent.profile.externalPortfolioUrl || ''} 
                      onChange={handleProfileChange} 
                      className={`w-full p-3 border rounded-xl outline-none focus:border-blue-500 ${!isValidUrl(currentContent.profile.externalPortfolioUrl || '') && currentContent.profile.externalPortfolioUrl ? 'border-red-300 bg-red-50' : ''}`} 
                      dir="ltr" 
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <button onClick={() => {
                const id = Date.now().toString();
                const newP = { id, title: "مشروع جديد", category: "تصميم", description: "", imageUrl: "https://placehold.co/800x600", featured: false, visible: true, openInNewTab: true, tags: [] };
                setLocalData(prev => ({ en: {...prev.en, projects: [newP, ...prev.en.projects]}, ar: {...prev.ar, projects: [newP, ...prev.ar.projects]} }));
                setHasUnsavedChanges(true);
              }} className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl border-2 border-dashed border-blue-200 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all">
                <Plus /> إضافة مشروع جديد
              </button>
              {currentContent.projects.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-6">
                  <div className="relative group w-full md:w-48 h-32 flex-shrink-0">
                    <img src={p.imageUrl} className="w-full h-full object-cover rounded-xl border" />
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl text-white">
                        <ImageIcon size={24} className="mb-1" />
                        <span className="text-xs font-bold">تغيير الصورة</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProjectImageUpload(p.id, e)} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-4">
                    <input value={p.title} onChange={e => updateLocal({...currentContent, projects: currentContent.projects.map(item => item.id === p.id ? {...item, title: e.target.value} : item)})} className="font-bold text-lg w-full border-b p-1" placeholder="عنوان المشروع" />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-xs font-bold text-gray-500 block mb-1">التصنيف الرئيسي</label>
                             <input value={p.category} onChange={e => updateLocal({...currentContent, projects: currentContent.projects.map(item => item.id === p.id ? {...item, category: e.target.value} : item)})} className="text-sm border-b p-1 w-full" placeholder="مثال: هوية بصرية" />
                        </div>
                        <div>
                             <label className="text-xs font-bold text-gray-500 block mb-1">رابط المشروع</label>
                             <input value={p.externalLink || ''} onChange={e => updateLocal({...currentContent, projects: currentContent.projects.map(item => item.id === p.id ? {...item, externalLink: e.target.value} : item)})} className="text-sm border-b p-1 w-full" placeholder="https://..." dir="ltr" />
                        </div>
                    </div>

                    {/* Custom Filters / Tags Section */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="text-xs font-bold text-gray-500 block mb-2 flex items-center gap-1"><Tag size={12}/> فلاتر إضافية (تظهر في الموقع)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                             {(p.tags || []).map((tag, idx) => (
                                 <span key={idx} className="bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm">
                                     {tag}
                                     <button onClick={() => handleRemoveTag(p.id, tag)} className="hover:text-red-500"><X size={12} /></button>
                                 </span>
                             ))}
                        </div>
                        <input 
                            placeholder="اكتب فلتر (مثال: تطبيقات) واضغط Enter" 
                            className="text-sm border p-2 rounded-lg w-full focus:outline-none focus:border-blue-400"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag(p.id, e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>

                    <RichTextEditor value={p.description} onChange={val => updateLocal({...currentContent, projects: currentContent.projects.map(item => item.id === p.id ? {...item, description: val} : item)})} />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" checked={p.visible} onChange={e => updateLocal({...currentContent, projects: currentContent.projects.map(item => item.id === p.id ? {...item, visible: e.target.checked} : item)})} /> إظهار
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" checked={p.featured} onChange={e => updateLocal({...currentContent, projects: currentContent.projects.map(item => item.id === p.id ? {...item, featured: e.target.checked} : item)})} /> مميز
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" checked={p.openInNewTab !== false} onChange={e => updateLocal({...currentContent, projects: currentContent.projects.map(item => item.id === p.id ? {...item, openInNewTab: e.target.checked} : item)})} /> نافذة جديدة
                        </label>
                      </div>
                      <button onClick={() => initiateDelete('project', p.id, p.title)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={20} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
               <button onClick={() => {
                  const newCat = { id: Date.now().toString(), name: "فئة مهارات جديدة", skills: [] };
                  setLocalData(prev => ({
                      en: { ...prev.en, skillCategories: [...prev.en.skillCategories, newCat] },
                      ar: { ...prev.ar, skillCategories: [...prev.ar.skillCategories, newCat] }
                  }));
                  setHasUnsavedChanges(true);
               }} className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl border-2 border-dashed border-blue-200 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all">
                  <Plus /> إضافة قسم مهارات جديد
               </button>

               {currentContent.skillCategories.map(cat => (
                  <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                      <div className="flex justify-between items-center border-b pb-4">
                          <input 
                            value={cat.name} 
                            onChange={(e) => {
                                const update = (cats: SkillCategory[]) => cats.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c);
                                setLocalData(prev => ({
                                    en: { ...prev.en, skillCategories: update(prev.en.skillCategories) },
                                    ar: { ...prev.ar, skillCategories: update(prev.ar.skillCategories) }
                                }));
                                setHasUnsavedChanges(true);
                            }}
                            className="text-xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-100 rounded-lg p-1 w-full ml-4"
                            placeholder="اسم القسم (مثال: تصميم الجرافيك)"
                          />
                          <button onClick={() => initiateDelete('skill', cat.id, cat.name)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"><Trash2 size={20} /></button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                          {cat.skills.map((skill, idx) => (
                              <div key={idx} className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium animate-fade-in-up">
                                  {skill}
                                  <button onClick={() => {
                                      const update = (cats: SkillCategory[]) => cats.map(c => c.id === cat.id ? { ...c, skills: c.skills.filter((_, i) => i !== idx) } : c);
                                      setLocalData(prev => ({
                                          en: { ...prev.en, skillCategories: update(prev.en.skillCategories) },
                                          ar: { ...prev.ar, skillCategories: update(prev.ar.skillCategories) }
                                      }));
                                      setHasUnsavedChanges(true);
                                  }} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14}/></button>
                              </div>
                          ))}
                          <div className="flex items-center gap-2 relative group">
                              <Plus size={16} className="absolute right-2 text-gray-400" />
                              <input 
                                placeholder="إضافة مهارة..."
                                className="bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none text-sm pr-8 pl-3 py-1.5 rounded-lg min-w-[150px] transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value.trim();
                                        if(val) {
                                            const update = (cats: SkillCategory[]) => cats.map(c => c.id === cat.id ? { ...c, skills: [...c.skills, val] } : c);
                                            setLocalData(prev => ({
                                                en: { ...prev.en, skillCategories: update(prev.en.skillCategories) },
                                                ar: { ...prev.ar, skillCategories: update(prev.ar.skillCategories) }
                                            }));
                                            setHasUnsavedChanges(true);
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                              />
                          </div>
                      </div>
                  </div>
               ))}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
                <button onClick={() => {
                const id = Date.now().toString();
                const newExp = { id, role: "المسمى الوظيفي", company: "اسم الشركة", period: "2024 - الحاضر", description: "" };
                setLocalData(prev => ({ en: {...prev.en, experiences: [newExp, ...prev.en.experiences]}, ar: {...prev.ar, experiences: [newExp, ...prev.ar.experiences]} }));
                setHasUnsavedChanges(true);
              }} className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl border-2 border-dashed border-blue-200 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all">
                <Plus /> إضافة خبرة جديدة
              </button>
              {currentContent.experiences.map(exp => (
                  <div key={exp.id} className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                      <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={exp.role} onChange={e => updateLocal({...currentContent, experiences: currentContent.experiences.map(item => item.id === exp.id ? {...item, role: e.target.value} : item)})} className="font-bold text-lg border-b p-1 outline-none focus:border-blue-500" placeholder="المسمى الوظيفي" />
                                <input value={exp.company} onChange={e => updateLocal({...currentContent, experiences: currentContent.experiences.map(item => item.id === exp.id ? {...item, company: e.target.value} : item)})} className="text-gray-600 border-b p-1 outline-none focus:border-blue-500" placeholder="اسم الشركة" />
                             </div>
                             <input value={exp.period} onChange={e => updateLocal({...currentContent, experiences: currentContent.experiences.map(item => item.id === exp.id ? {...item, period: e.target.value} : item)})} className="text-sm text-blue-500 border-b p-1 w-full outline-none focus:border-blue-500" placeholder="الفترة الزمنية" dir="ltr" />
                             <textarea value={exp.description} onChange={e => updateLocal({...currentContent, experiences: currentContent.experiences.map(item => item.id === exp.id ? {...item, description: e.target.value} : item)})} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 text-sm h-24" placeholder="وصف المهام..." />
                          </div>
                          <button onClick={() => initiateDelete('experience', exp.id, exp.role)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={20} /></button>
                      </div>
                  </div>
              ))}
            </div>
          )}

          {activeTab === 'education' && (
             <div className="space-y-6">
                <button onClick={() => {
                const id = Date.now().toString();
                const newEdu = { id, degree: "الدرجة العلمية", institution: "الجامعة / المعهد", year: "2024", grade: "" };
                setLocalData(prev => ({ en: {...prev.en, education: [newEdu, ...prev.en.education]}, ar: {...prev.ar, education: [newEdu, ...prev.ar.education]} }));
                setHasUnsavedChanges(true);
              }} className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl border-2 border-dashed border-blue-200 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all">
                <Plus /> إضافة مؤهل تعليمي
              </button>
              {currentContent.education.map(edu => (
                  <div key={edu.id} className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                      <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-4">
                             <input value={edu.degree} onChange={e => updateLocal({...currentContent, education: currentContent.education.map(item => item.id === edu.id ? {...item, degree: e.target.value} : item)})} className="font-bold text-lg border-b p-1 w-full outline-none focus:border-blue-500" placeholder="الدرجة العلمية" />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={edu.institution} onChange={e => updateLocal({...currentContent, education: currentContent.education.map(item => item.id === edu.id ? {...item, institution: e.target.value} : item)})} className="text-gray-600 border-b p-1 outline-none focus:border-blue-500" placeholder="المؤسسة التعليمية" />
                                <div className="flex gap-2">
                                    <input value={edu.year} onChange={e => updateLocal({...currentContent, education: currentContent.education.map(item => item.id === edu.id ? {...item, year: e.target.value} : item)})} className="text-sm border-b p-1 w-1/3 outline-none focus:border-blue-500" placeholder="السنة" />
                                    <input value={edu.grade || ''} onChange={e => updateLocal({...currentContent, education: currentContent.education.map(item => item.id === edu.id ? {...item, grade: e.target.value} : item)})} className="text-sm border-b p-1 w-2/3 outline-none focus:border-blue-500" placeholder="التقدير (اختياري)" />
                                </div>
                             </div>
                          </div>
                          <button onClick={() => initiateDelete('education', edu.id, edu.degree)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={20} /></button>
                      </div>
                  </div>
              ))}
             </div>
          )}

          {activeTab === 'custom' && (
             <div className="space-y-6">
                <button onClick={() => {
                const id = Date.now().toString();
                const newSec = { id, title: "قسم جديد", content: "محتوى القسم...", visible: true };
                setLocalData(prev => ({ en: {...prev.en, customSections: [newSec, ...prev.en.customSections]}, ar: {...prev.ar, customSections: [newSec, ...prev.ar.customSections]} }));
                setHasUnsavedChanges(true);
              }} className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl border-2 border-dashed border-blue-200 font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all">
                <Plus /> إضافة قسم مخصص
              </button>
              {currentContent.customSections.map(sec => (
                  <div key={sec.id} className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                      <div className="flex justify-between items-center mb-4">
                          <input value={sec.title} onChange={e => updateLocal({...currentContent, customSections: currentContent.customSections.map(item => item.id === sec.id ? {...item, title: e.target.value} : item)})} className="font-bold text-lg border-b p-1 outline-none focus:border-blue-500" placeholder="عنوان القسم" />
                          <div className="flex items-center gap-2">
                             <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input type="checkbox" checked={sec.visible} onChange={e => updateLocal({...currentContent, customSections: currentContent.customSections.map(item => item.id === sec.id ? {...item, visible: e.target.checked} : item)})} /> إظهار
                             </label>
                             <button onClick={() => initiateDelete('custom', sec.id, sec.title)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={20} /></button>
                          </div>
                      </div>
                      <RichTextEditor value={sec.content} onChange={val => updateLocal({...currentContent, customSections: currentContent.customSections.map(item => item.id === sec.id ? {...item, content: val} : item)})} />
                  </div>
              ))}
             </div>
          )}

        </div>
      </main>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
            <h3 className="text-2xl font-bold mb-2">تأكيد الحذف</h3>
            <p className="text-gray-500 mb-8">هل أنت متأكد من حذف {deleteTarget.name}؟ لا يمكن التراجع.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">إلغاء</button>
              <button onClick={executeDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">نعم، حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};