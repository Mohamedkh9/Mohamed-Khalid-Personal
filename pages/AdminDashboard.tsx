import React, { useState, useEffect, useMemo } from 'react';
import { PortfolioData, PortfolioContent, Project, Experience, Education, CustomSection, Language, SkillCategory } from '../types';
import { LogOut, LayoutDashboard, Briefcase, User, Layers, Plus, Trash2, GripVertical, Image as ImageIcon, GraduationCap, ChevronUp, ChevronDown, FileText, Link as LinkIcon, ExternalLink, Globe, LayoutTemplate, AlertCircle, Save, CheckCircle, Camera, Menu, X, Star, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RichTextEditor } from '../components/admin/RichTextEditor';

interface AdminDashboardProps {
  data: PortfolioData;
  onUpdate: (newData: PortfolioData) => void;
  onLogout: () => void;
}

// Helper to validate URL
const isValidUrl = (urlString: string) => {
  if (!urlString) return true; // Empty is valid (optional)
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

// Helper to compress image
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
        
        // Max dimension for optimization (1920px is good for full screen portfolio)
        const MAX_SIZE = 1920;
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
            // Compress to WebP at 0.8 quality for good balance of size/quality
            resolve(canvas.toDataURL('image/webp', 0.8));
        } else {
            reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

// --- Delete Confirmation Modal Component ---
interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
             <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-500 leading-relaxed">{message}</p>
          
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <button 
              onClick={onCancel}
              className="px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button 
              onClick={onConfirm}
              className="px-6 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5"
            >
              نعم، حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdate, onLogout }) => {
  const [localData, setLocalData] = useState<PortfolioData>(data);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'skills' | 'experience' | 'education' | 'custom'>('profile');
  const [editingLanguage, setEditingLanguage] = useState<Language>('en');
  const [draggedProjectIndex, setDraggedProjectIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // UI States
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name?: string } | null>(null);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.body.style.fontFamily = "'Cairo', sans-serif";
  }, []);

  const currentContent: PortfolioContent = localData[editingLanguage];

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    currentContent.projects.forEach(p => {
      if (p.category) {
        p.category.split(',').forEach(c => cats.add(c.trim()));
      }
    });
    return Array.from(cats).sort();
  }, [currentContent.projects]);

  const updateContent = (newContent: PortfolioContent) => {
    setLocalData(prev => ({
      ...prev,
      [editingLanguage]: newContent
    }));
    setHasUnsavedChanges(true);
    setShowSaveSuccess(false);
  };

  const handleSave = () => {
    onUpdate(localData);
    setHasUnsavedChanges(false);
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  const moveItem = <T,>(list: T[], index: number, direction: 'up' | 'down'): T[] => {
    const newList = [...list];
    if (direction === 'up' && index > 0) {
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < newList.length - 1) {
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    return newList;
  };

  // --- Profile Handlers ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateContent({
      ...currentContent,
      profile: { ...currentContent.profile, [e.target.name]: e.target.value }
    });
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const input = e.target;
    if (file) {
      setIsCompressing(true);
      try {
        const compressedUrl = await compressImage(file);
        setLocalData(prev => ({
          en: { ...prev.en, profile: { ...prev.en.profile, avatarUrl: compressedUrl } },
          ar: { ...prev.ar, profile: { ...prev.ar.profile, avatarUrl: compressedUrl } }
        }));
        setHasUnsavedChanges(true);
        setShowSaveSuccess(false);
      } catch (error) {
        console.error("Profile image compression failed", error);
        // Fallback
        const reader = new FileReader();
        reader.onloadend = () => {
             const result = reader.result as string;
             setLocalData(prev => ({
                en: { ...prev.en, profile: { ...prev.en.profile, avatarUrl: result } },
                ar: { ...prev.ar, profile: { ...prev.ar.profile, avatarUrl: result } }
             }));
             setHasUnsavedChanges(true);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
        if (input) input.value = '';
      }
    }
  };

  // --- DELETE LOGIC ---
  const initiateDelete = (type: string, id: string, name: string = '') => {
    setDeleteTarget({ type, id, name });
  };

  const executeDelete = () => {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;
    
    setLocalData(prev => {
      const newData = { ...prev };
      
      // Helper to filter safely
      const filterItems = (items: any[] | undefined) => (items || []).filter(item => item.id !== id);

      if (type === 'project') {
        newData.en.projects = filterItems(prev.en.projects);
        newData.ar.projects = filterItems(prev.ar.projects);
      } else if (type === 'skill') {
        newData.en.skillCategories = filterItems(prev.en.skillCategories);
        newData.ar.skillCategories = filterItems(prev.ar.skillCategories);
      } else if (type === 'experience') {
        newData.en.experiences = filterItems(prev.en.experiences);
        newData.ar.experiences = filterItems(prev.ar.experiences);
      } else if (type === 'education') {
        newData.en.education = filterItems(prev.en.education);
        newData.ar.education = filterItems(prev.ar.education);
      } else if (type === 'custom') {
        newData.en.customSections = filterItems(prev.en.customSections);
        newData.ar.customSections = filterItems(prev.ar.customSections);
      }

      return newData;
    });

    setHasUnsavedChanges(true);
    setDeleteTarget(null);
  };

  // --- Project Handlers ---
  const handleAddProject = () => {
    const newId = Date.now().toString() + Math.random().toString().slice(2);
    const baseProject: Project = {
      id: newId,
      category: "General",
      description: "",
      imageUrl: "https://placehold.co/800x600/e2e8f0/1e293b?text=Project+Image",
      featured: true,
      visible: true,
      externalLink: "",
      openInNewTab: true,
      title: ""
    };

    setLocalData(prev => ({
      en: { ...prev.en, projects: [{...baseProject, title: "New Project"}, ...prev.en.projects] },
      ar: { ...prev.ar, projects: [{...baseProject, title: "مشروع جديد", category: "عام"}, ...prev.ar.projects] }
    }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateProject = (id: string, field: keyof Project, value: any) => {
    updateContent({
      ...currentContent,
      projects: currentContent.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    updateContent({ ...currentContent, projects: moveItem(currentContent.projects, index, direction) });
  };
  
  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const input = e.target;
    if (file) {
      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
           alert('Please upload a valid image (JPG, PNG, WebP).');
           return;
      }
      setIsCompressing(true);
      try {
        const compressedUrl = await compressImage(file);
        const updateProjectList = (projects: Project[]) => 
            projects.map(p => p.id === id ? { ...p, imageUrl: compressedUrl } : p);

        setLocalData(prev => ({
            en: { ...prev.en, projects: updateProjectList(prev.en.projects) },
            ar: { ...prev.ar, projects: updateProjectList(prev.ar.projects) }
        }));
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error("Image compression failed", error);
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const updateProjectList = (projects: Project[]) => 
                projects.map(p => p.id === id ? { ...p, imageUrl: result } : p);
            setLocalData(prev => ({
                en: { ...prev.en, projects: updateProjectList(prev.en.projects) },
                ar: { ...prev.ar, projects: updateProjectList(prev.ar.projects) }
            }));
            setHasUnsavedChanges(true);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
        if (input) input.value = '';
      }
    }
  };

  // --- Skills Handlers ---
  const handleAddSkillCategory = () => {
    const newId = Date.now().toString() + Math.random().toString().slice(2);
    const baseCategory: SkillCategory = { id: newId, name: "", skills: [] };
    
    setLocalData(prev => ({
      en: { ...prev.en, skillCategories: [...prev.en.skillCategories, { ...baseCategory, name: "New Category" }] },
      ar: { ...prev.ar, skillCategories: [...prev.ar.skillCategories, { ...baseCategory, name: "تصنيف جديد" }] }
    }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateSkillCategoryName = (id: string, name: string) => {
    updateContent({
      ...currentContent,
      skillCategories: currentContent.skillCategories.map(c => c.id === id ? { ...c, name } : c)
    });
  };

  const handleSkillChange = (catId: string, skillsStr: string) => {
    const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(s => s !== '');
    updateContent({
      ...currentContent,
      skillCategories: currentContent.skillCategories.map(c => 
        c.id === catId ? { ...c, skills: skillsArray } : c
      )
    });
  };

  const handleMoveSkillCategory = (index: number, direction: 'up' | 'down') => {
    updateContent({ ...currentContent, skillCategories: moveItem(currentContent.skillCategories, index, direction) });
  };

  // --- Experience Handlers ---
  const handleAddExperience = () => {
     const newId = Date.now().toString() + Math.random().toString().slice(2);
     const baseExp: Experience = { id: newId, company: "", period: "", description: "", role: "" };
     
     setLocalData(prev => ({
       en: { ...prev.en, experiences: [{ ...baseExp, role: "New Role" }, ...prev.en.experiences] },
       ar: { ...prev.ar, experiences: [{ ...baseExp, role: "منصب جديد" }, ...prev.ar.experiences] }
     }));
     setHasUnsavedChanges(true);
  };
  
  const handleUpdateExperience = (id: string, field: keyof Experience, value: string) => {
     updateContent({
       ...currentContent,
       experiences: currentContent.experiences.map(e => e.id === id ? {...e, [field]: value} : e)
     });
  };

  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    updateContent({ ...currentContent, experiences: moveItem(currentContent.experiences, index, direction) });
  };
  
  // --- Education Handlers ---
  const handleAddEducation = () => {
    const newId = Date.now().toString() + Math.random().toString().slice(2);
    const baseEdu: Education = { id: newId, degree: "", institution: "", year: "", grade: "" };

    setLocalData(prev => ({
      en: { ...prev.en, education: [{...baseEdu, degree: "New Degree"}, ...(prev.en.education || [])] },
      ar: { ...prev.ar, education: [{...baseEdu, degree: "درجة جديدة"}, ...(prev.ar.education || [])] }
    }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateEducation = (id: string, field: keyof Education, value: string) => {
    const currentEduList = currentContent.education || [];
    updateContent({
      ...currentContent,
      education: currentEduList.map(e => e.id === id ? {...e, [field]: value} : e)
    });
  };

  const handleMoveEducation = (index: number, direction: 'up' | 'down') => {
    const currentEduList = currentContent.education || [];
    updateContent({ ...currentContent, education: moveItem(currentEduList, index, direction) });
  };

  // --- Custom Section Handlers ---
  const handleAddCustomSection = () => {
    const newId = Date.now().toString() + Math.random().toString().slice(2);
    const baseSection: CustomSection = { id: newId, content: "", visible: true, title: "" };

    setLocalData(prev => ({
      en: { ...prev.en, customSections: [...(prev.en.customSections || []), { ...baseSection, title: "New Section" }] },
      ar: { ...prev.ar, customSections: [...(prev.ar.customSections || []), { ...baseSection, title: "قسم جديد" }] }
    }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateCustomSection = (id: string, field: keyof CustomSection, value: any) => {
    const currentSections = currentContent.customSections || [];
    updateContent({
      ...currentContent,
      customSections: currentSections.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.drag-handle')) {
      e.preventDefault();
      return;
    }
    setDraggedProjectIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); e.dataTransfer.dropEffect = "move";
    if (draggedProjectIndex !== index) setDragOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); setDragOverIndex(null);
    if (draggedProjectIndex === null || draggedProjectIndex === index) return;
    const newProjects = [...currentContent.projects];
    const [draggedItem] = newProjects.splice(draggedProjectIndex, 1);
    newProjects.splice(index, 0, draggedItem);
    updateContent({ ...currentContent, projects: newProjects });
    setDraggedProjectIndex(null);
  };
  const handleDragEnd = () => { setDraggedProjectIndex(null); setDragOverIndex(null); };

  const SidebarItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button 
      onClick={() => { setActiveTab(id as any); setIsSidebarOpen(false); }} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 font-medium ${
        activeTab === id 
        ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-900/20' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={20} strokeWidth={1.5} /> 
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-[#F3F4F6] text-gray-800 font-cairo text-right" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-[#1e293b] text-white flex-col shadow-2xl z-50 transition-transform duration-300 md:translate-x-0 md:static md:flex ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 border-b border-white/10 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            لوحة <span className="text-[#3B82F6]">التحكم</span>
          </h1>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarItem id="profile" label="البيانات الشخصية" icon={User} />
          <SidebarItem id="projects" label="معرض الأعمال" icon={ImageIcon} />
          <SidebarItem id="skills" label="المهارات" icon={Layers} />
          <SidebarItem id="experience" label="الخبرات العملية" icon={Briefcase} />
          <SidebarItem id="education" label="المؤهلات العلمية" icon={GraduationCap} />
          <SidebarItem id="custom" label="أقسام مخصصة" icon={LayoutTemplate} />
        </nav>
        <div className="p-6 mt-auto border-t border-white/10 bg-[#0f172a]">
          <Link to="/" className="flex items-center justify-center gap-2 w-full text-sm text-gray-400 hover:text-white mb-4 transition-colors py-2 rounded-lg hover:bg-white/5">
            <ExternalLink size={16} /> معاينة الموقع
          </Link>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4c3a45] text-[#fca5a5] hover:bg-[#7f1d1d] hover:text-white rounded-lg transition-colors font-medium border border-[#7f1d1d]/30">
            <LogOut size={18} className={editingLanguage === 'ar' ? "rotate-180" : ""} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm sticky top-2 z-30">
           <div className="flex justify-between items-center w-full md:w-auto">
               <div className="flex items-center gap-3">
                  <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={24} />
                  </button>
                  <h1 className="text-xl font-bold text-primary flex items-center gap-2 md:hidden">
                    <LayoutDashboard size={20} /> لوحة التحكم
                  </h1>
               </div>
               
               <div className="flex items-center gap-3 md:hidden">
                  {isCompressing && <ImageIcon size={20} className="text-[#3B82F6] animate-pulse" />}
                  <button onClick={handleSave} className={`p-2 rounded-lg ${hasUnsavedChanges ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-400'}`}><Save size={20} /></button>
               </div>
            </div>

            <div className="hidden md:flex flex-1 items-center gap-6 text-gray-500 w-full md:w-auto">
               <div className="flex items-center gap-3">
                 <Globe size={20} className="text-[#3B82F6]" />
                 <span className="text-sm font-medium">أنت تقوم الآن بتعديل المحتوى:</span>
               </div>
               <div className="bg-gray-100 p-1 rounded-xl border border-gray-200 flex shadow-inner">
                <button onClick={() => setEditingLanguage('ar')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${editingLanguage === 'ar' ? 'bg-white text-[#3B82F6] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>العربية</button>
                <button onClick={() => setEditingLanguage('en')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${editingLanguage === 'en' ? 'bg-white text-[#3B82F6] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>English</button>
              </div>
              {isCompressing && <div className="flex items-center gap-2 text-[#3B82F6] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-sm animate-pulse"><ImageIcon size={16} /> جاري ضغط الصورة...</div>}
            </div>

            <div className="hidden md:flex items-center gap-4 w-full md:w-auto justify-end">
              {showSaveSuccess && <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-2"><CheckCircle size={18} /><span className="font-bold text-sm">تم الحفظ بنجاح</span></div>}
              <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${hasUnsavedChanges ? 'bg-[#3B82F6] hover:bg-blue-600 shadow-blue-500/30' : 'bg-gray-400 hover:bg-gray-500 shadow-gray-400/30'}`}><Save size={20} /><span>حفظ التغييرات</span></button>
            </div>
        </div>

        {activeTab === 'profile' && (
          <div className="max-w-4xl bg-white rounded-3xl shadow-lg shadow-gray-200/50 p-8 border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-gray-100">
              <div className="relative group cursor-pointer">
                 <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-gray-100 group-hover:ring-[#3B82F6] transition-all">
                    <img src={currentContent.profile.avatarUrl || "https://placehold.co/400x400/1e293b/ffffff?text=Avatar"} alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                   <Camera className="text-white" size={24} />
                   <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleProfileImageUpload} />
                 </label>
              </div>
              <div className="flex-1 text-center md:text-right space-y-4 w-full">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الاسم الكامل</label>
                      <input type="text" name="name" value={currentContent.profile.name} onChange={handleProfileChange} className="w-full text-2xl font-bold text-[#1e293b] border-b-2 border-transparent hover:border-gray-200 focus:border-[#3B82F6] outline-none bg-transparent transition-colors px-1" placeholder="الاسم الكامل" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">المسمى الوظيفي</label>
                      <input type="text" name="title" value={currentContent.profile.title} onChange={handleProfileChange} className="w-full text-xl text-[#3B82F6] font-medium border-b-2 border-transparent hover:border-gray-200 focus:border-[#3B82F6] outline-none bg-transparent transition-colors px-1" placeholder="المسمى الوظيفي" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} />
                    </div>
                 </div>
                 <p className="text-gray-400 text-sm">قم بالنقر على الصورة لتغييرها</p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2"><FileText size={20} className="text-[#3B82F6]" /> نبذة تعريفية (Bio)</h3>
                <textarea name="bio" value={currentContent.profile.bio} onChange={handleProfileChange} rows={4} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all bg-gray-50/50 focus:bg-white resize-none text-lg leading-relaxed" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} />
              </div>
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-bold text-lg mb-6 text-gray-800 flex items-center gap-2"><LinkIcon size={20} className="text-[#3B82F6]" /> الروابط ومعلومات الاتصال</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">رابط ملف الأعمال الخارجي (PDF/Drive Link)</label>
                    <div className="relative">
                      <ExternalLink className="absolute top-3.5 right-4 text-gray-400" size={18} />
                      <input type="url" name="externalPortfolioUrl" value={currentContent.profile.externalPortfolioUrl || ''} onChange={handleProfileChange} placeholder="https://..." className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" dir="ltr" />
                    </div>
                  </div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label><input type="email" name="email" value={currentContent.profile.email} onChange={handleProfileChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] outline-none transition-all bg-gray-50 focus:bg-white" dir="ltr" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">رابط الهاتف</label><input type="text" name="phone" value={currentContent.profile.phone || ''} onChange={handleProfileChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] outline-none transition-all bg-gray-50 focus:bg-white" dir="ltr" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">رابط LinkedIn</label><input type="url" name="linkedin" value={currentContent.profile.linkedin} onChange={handleProfileChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] outline-none transition-all bg-gray-50 focus:bg-white" dir="ltr" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">رابط Behance</label><input type="url" name="behance" value={currentContent.profile.behance} onChange={handleProfileChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] outline-none transition-all bg-gray-50 focus:bg-white" dir="ltr" /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-[#1e293b] flex items-center gap-2"><ImageIcon className="text-[#3B82F6]" /> معرض الأعمال ({editingLanguage.toUpperCase()})</h2>
              <button onClick={handleAddProject} className="flex items-center gap-2 bg-[#3B82F6] text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 font-bold"><Plus size={20} /> إضافة مشروع جديد</button>
            </div>
            <datalist id="category-suggestions">{uniqueCategories.map(cat => (<option key={cat} value={cat} />))}</datalist>
            <div className="grid gap-6">
              {currentContent.projects.map((project, index) => {
                const isExternalLinkValid = isValidUrl(project.externalLink || '');
                return (
                <div key={project.id} draggable={true} onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col md:flex-row transition-all duration-300 group ${draggedProjectIndex === index ? 'opacity-40 border-dashed border-[#3B82F6]' : 'border-gray-200 hover:border-[#3B82F6]/30 hover:shadow-md'} ${dragOverIndex === index ? 'ring-2 ring-[#3B82F6] ring-offset-2' : ''}`}>
                  <div className="bg-gray-50 border-l border-gray-100 flex md:flex-col flex-row items-center justify-center p-3 gap-2 w-full md:w-14">
                    <div className="drag-handle cursor-grab p-2 text-gray-400 hover:text-[#3B82F6] active:cursor-grabbing rounded hover:bg-white transition-colors" title="سحب لإعادة الترتيب"><GripVertical size={20} /></div>
                    <button onClick={() => handleMoveProject(index, 'up')} disabled={index === 0} className="p-1.5 rounded hover:bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronUp size={18} /></button>
                    <button onClick={() => handleMoveProject(index, 'down')} disabled={index === currentContent.projects.length - 1} className="p-1.5 rounded hover:bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronDown size={18} /></button>
                  </div>
                  <div className="w-full md:w-72 h-56 md:h-auto bg-gray-100 relative group/image overflow-hidden">
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105" />
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all cursor-pointer text-white backdrop-blur-sm"><ImageIcon size={28} className="mb-2" /><span className="text-sm font-bold">تحديث الصورة</span><input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleImageUpload(project.id, e)} /></label>
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-xs font-bold text-gray-500">عنوان المشروع</label><input type="text" value={project.title} onChange={(e) => handleUpdateProject(project.id, 'title', e.target.value)} className="w-full font-bold text-lg border-b-2 border-gray-100 focus:border-[#3B82F6] focus:outline-none bg-transparent py-1 transition-colors text-gray-800" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} /></div>
                      <div className="space-y-2"><label className="text-xs font-bold text-gray-500">التصنيف (Category)</label><input type="text" value={project.category} onChange={(e) => handleUpdateProject(project.id, 'category', e.target.value)} className="w-full text-sm text-gray-600 border-b-2 border-gray-100 focus:border-[#3B82F6] focus:outline-none bg-transparent py-1 transition-colors" list="category-suggestions" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} /></div>
                    </div>
                    <div className="space-y-2 flex-1"><label className="text-xs font-bold text-gray-500">وصف المشروع</label><RichTextEditor value={project.description} onChange={(val) => handleUpdateProject(project.id, 'description', val)} dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} /></div>
                    
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500">رابط خارجي للمشروع</label>
                       <div className="flex flex-col gap-2">
                            <div className={`flex items-center gap-3 bg-gray-50 p-3 rounded-xl border transition-all ${!isExternalLinkValid ? 'border-red-300 ring-1 ring-red-100 bg-red-50' : 'border-gray-200 focus-within:ring-1 focus-within:ring-[#3B82F6]'}`}>
                                <LinkIcon size={16} className={!isExternalLinkValid ? "text-red-400" : "text-gray-400"} />
                                <input type="url" value={project.externalLink || ''} onChange={(e) => handleUpdateProject(project.id, 'externalLink', e.target.value)} className={`flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-gray-400 ${!isExternalLinkValid ? 'text-red-600' : ''}`} dir="ltr" placeholder="https://..." />
                            </div>
                            
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none w-fit">
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={project.openInNewTab !== false} 
                                        onChange={(e) => handleUpdateProject(project.id, 'openInNewTab', e.target.checked)} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                                </div>
                                <span className="font-medium">فتح الرابط في نافذة جديدة</span>
                            </label>
                       </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                      <div className="flex flex-col gap-2">
                         <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer select-none hover:text-[#3B82F6] transition-colors">
                            <input type="checkbox" checked={project.visible} onChange={(e) => handleUpdateProject(project.id, 'visible', e.target.checked)} className="w-4.5 h-4.5 rounded text-[#3B82F6] focus:ring-[#3B82F6] border-gray-300" /> 
                            <span>عرض في الموقع</span>
                         </label>
                         <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer select-none hover:text-[#F59E0B] transition-colors">
                            <input type="checkbox" checked={project.featured} onChange={(e) => handleUpdateProject(project.id, 'featured', e.target.checked)} className="w-4.5 h-4.5 rounded text-[#F59E0B] focus:ring-[#F59E0B] border-gray-300" /> 
                            <span className="flex items-center gap-1"><Star size={14} className={project.featured ? "fill-yellow-400 text-yellow-400" : ""} /> مشروع مميز (الصفحة الرئيسية)</span>
                         </label>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); initiateDelete('project', project.id, project.title); }} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold cursor-pointer"
                      >
                        <Trash2 size={16} /> حذف
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="max-w-4xl bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
               <h2 className="text-2xl font-bold text-[#1e293b] flex items-center gap-2"><Layers className="text-[#3B82F6]" /> المهارات ({editingLanguage.toUpperCase()})</h2>
               <button onClick={handleAddSkillCategory} className="flex items-center gap-2 bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-bold"><Plus size={18} /> تصنيف جديد</button>
            </div>
            <div className="space-y-8">
              {currentContent.skillCategories.map((cat, index) => (
                 <div key={cat.id} className="relative group bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <input type="text" value={cat.name} onChange={(e) => handleUpdateSkillCategoryName(cat.id, e.target.value)} className="font-bold text-lg text-[#1e293b] bg-transparent border-b-2 border-transparent focus:border-[#3B82F6] outline-none" placeholder="Category Name" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} />
                      <div className="flex gap-2">
                         <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                            <button onClick={() => handleMoveSkillCategory(index, 'up')} disabled={index === 0} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"><ChevronUp size={16} /></button>
                            <button onClick={() => handleMoveSkillCategory(index, 'down')} disabled={index === currentContent.skillCategories.length - 1} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"><ChevronDown size={16} /></button>
                         </div>
                         <button 
                            onClick={() => initiateDelete('skill', cat.id, cat.name)} 
                            className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                    </div>
                    <textarea value={cat.skills.join(', ')} onChange={(e) => handleSkillChange(cat.id, e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6] text-gray-700 bg-white outline-none min-h-[100px]" rows={3} dir="ltr" placeholder="Adobe Photoshop, Illustrator..." />
                 </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-[#1e293b] flex items-center gap-2"><Briefcase className="text-[#3B82F6]" /> الخبرات العملية ({editingLanguage.toUpperCase()})</h2>
              <button onClick={handleAddExperience} className="flex items-center gap-2 bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-bold"><Plus size={18} /> إضافة خبرة جديدة</button>
            </div>
             <div className="grid gap-4">
              {currentContent.experiences.map((exp, index) => (
                <div key={exp.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden group">
                  <div className="bg-gray-50 border-l border-gray-100 flex flex-col items-center justify-center p-2 gap-2 w-14">
                    <button onClick={() => handleMoveExperience(index, 'up')} disabled={index === 0} className="p-1.5 rounded hover:bg-white text-gray-500 disabled:opacity-30 transition-colors"><ChevronUp size={18} /></button>
                    <button onClick={() => handleMoveExperience(index, 'down')} disabled={index === currentContent.experiences.length - 1} className="p-1.5 rounded hover:bg-white text-gray-500 disabled:opacity-30 transition-colors"><ChevronDown size={18} /></button>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <div><label className="block text-xs font-bold text-gray-500 mb-1">المسمى الوظيفي</label><input type="text" value={exp.role} onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)} className="w-full font-bold text-lg border border-gray-200 p-3 rounded-xl focus:border-[#3B82F6] outline-none" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} /></div>
                        <div className="flex gap-4">
                          <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">الشركة / الجهة</label><input type="text" value={exp.company} onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)} className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:border-[#3B82F6] outline-none" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} /></div>
                          <div className="w-1/3"><label className="block text-xs font-bold text-gray-500 mb-1">فترة العمل</label><input type="text" value={exp.period} onChange={(e) => handleUpdateExperience(exp.id, 'period', e.target.value)} className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:border-[#3B82F6] outline-none" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} /></div>
                        </div>
                    </div>
                    <textarea value={exp.description} onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)} className="w-full text-gray-600 text-sm border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#3B82F6] mb-4 outline-none bg-gray-50 focus:bg-white resize-none" rows={3} dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} />
                     <div className="flex justify-end pt-2">
                        <button 
                            onClick={() => initiateDelete('experience', exp.id, exp.role)} 
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-bold"
                        >
                            <Trash2 size={16} /> حذف السجل
                        </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-[#1e293b] flex items-center gap-2"><GraduationCap className="text-[#3B82F6]" /> المؤهلات العلمية ({editingLanguage.toUpperCase()})</h2>
              <button onClick={handleAddEducation} className="flex items-center gap-2 bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-bold"><Plus size={18} /> إضافة مؤهل دراسي</button>
            </div>
            <div className="grid gap-4">
              {(currentContent.education || []).map((edu, index) => (
                <div key={edu.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
                   <div className="bg-gray-50 border-l border-gray-100 flex flex-col items-center justify-center p-2 gap-2 w-14">
                    <button onClick={() => handleMoveEducation(index, 'up')} disabled={index === 0} className="p-1.5 rounded hover:bg-white text-gray-500 disabled:opacity-30 transition-colors"><ChevronUp size={18} /></button>
                    <button onClick={() => handleMoveEducation(index, 'down')} disabled={index === (currentContent.education || []).length - 1} className="p-1.5 rounded hover:bg-white text-gray-500 disabled:opacity-30 transition-colors"><ChevronDown size={18} /></button>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <div><label className="block text-xs font-bold text-gray-500 mb-1">الدرجة العلمية</label><input type="text" value={edu.degree} onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)} className="w-full font-bold text-lg border border-gray-200 p-3 rounded-xl focus:border-[#3B82F6] outline-none" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} /></div>
                        <div className="flex gap-4">
                          <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">الجهة التعليمية</label><input type="text" value={edu.institution} onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)} className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:border-[#3B82F6] outline-none" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} /></div>
                          <div className="w-1/3"><label className="block text-xs font-bold text-gray-500 mb-1">سنة التخرج</label><input type="text" value={edu.year} onChange={(e) => handleUpdateEducation(edu.id, 'year', e.target.value)} className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:border-[#3B82F6] outline-none" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} /></div>
                        </div>
                    </div>
                     <div className="flex justify-end pt-2">
                        <button 
                            onClick={() => initiateDelete('education', edu.id, edu.degree)} 
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-bold"
                        >
                            <Trash2 size={16} /> حذف المؤهل
                        </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
           <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-[#1e293b] flex items-center gap-2"><LayoutTemplate className="text-[#3B82F6]" /> أقسام مخصصة ({editingLanguage.toUpperCase()})</h2>
              <button onClick={handleAddCustomSection} className="flex items-center gap-2 bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-bold"><Plus size={18} /> إضافة قسم جديد</button>
            </div>
             <div className="grid gap-6">
                {(currentContent.customSections || []).map(section => (
                  <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                      <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">عنوان القسم</label>
                            <input type="text" value={section.title} onChange={(e) => handleUpdateCustomSection(section.id, 'title', e.target.value)} className="text-xl font-bold text-primary border-b-2 border-gray-100 focus:border-[#3B82F6] outline-none w-full py-1 bg-transparent" dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} />
                          </div>
                          <button 
                            onClick={() => initiateDelete('custom', section.id, section.title)} 
                            className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={20} />
                          </button>
                      </div>
                      <RichTextEditor value={section.content} onChange={(val) => handleUpdateCustomSection(section.id, 'content', val)} dir={editingLanguage === 'ar' ? 'rtl' : 'ltr'} />
                       <div className="mt-4 flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer select-none"><input type="checkbox" checked={section.visible} onChange={(e) => handleUpdateCustomSection(section.id, 'visible', e.target.checked)} className="w-4.5 h-4.5 rounded text-[#3B82F6] focus:ring-[#3B82F6] border-gray-300" /> إظهار القسم في الموقع</label>
                       </div>
                  </div>
                ))}
             </div>
           </div>
        )}
      </main>

      <DeleteModal 
        isOpen={!!deleteTarget}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من رغبتك في حذف "${deleteTarget?.name || 'هذا العنصر'}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};