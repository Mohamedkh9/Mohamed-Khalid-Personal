import { PortfolioData, PortfolioContent } from './types';

const COMMON_PROJECTS = [
  {
    id: "p1",
    title: "Frenzy Ice Cream",
    category: "Branding",
    description: "Complete visual identity and packaging design for Frenzy Ice Cream (2024), including fridge stickers, door scripts, and product packaging.",
    imageUrl: "https://placehold.co/800x600/2F80ED/ffffff?text=Frenzy+Ice+Cream",
    featured: true,
    visible: true,
    openInNewTab: true
  },
  {
    id: "p2",
    title: "Carrefour Market UAE",
    category: "Social Media",
    description: "Remote graphic design for Carrefour Market UAE (2023), creating engaging 'Sales Season' campaigns and visual 3D content for digital platforms.",
    imageUrl: "https://placehold.co/800x600/e63946/ffffff?text=Carrefour+UAE",
    featured: true,
    visible: true,
    openInNewTab: true
  },
  {
    id: "p3",
    title: "Botter Agency",
    category: "Social Media",
    description: "Designed social media content for various clients including Al-Fuhod Academy and Dr. Mohamed Yassin Al-Ayouty (2024).",
    imageUrl: "https://placehold.co/800x600/1C2A4A/ffffff?text=Botter+Agency",
    featured: true,
    visible: true,
    openInNewTab: true
  },
  {
    id: "p4",
    title: "Mansoura University",
    category: "Branding",
    description: "Developed logos and marketing materials for the Community Service Sector and University Performance Development Center.",
    imageUrl: "https://placehold.co/800x600/f1c40f/333333?text=Mansoura+University",
    featured: false,
    visible: true,
    openInNewTab: true
  },
  {
    id: "p5",
    title: "EVIS Exhibition",
    category: "Video Editing",
    description: "Montage and video editing for the Electric Vehicle Innovation Summit (EVIS) in Abu Dhabi (2023).",
    imageUrl: "https://placehold.co/800x600/27ae60/ffffff?text=EVIS+Exhibition",
    featured: false,
    visible: true,
    openInNewTab: true
  },
  {
    id: "p6",
    title: "Kefaya Musaken",
    category: "Campaign",
    description: "Graduation project 'Enough Painkillers' - an awareness campaign designed for the Faculty of Specific Education.",
    imageUrl: "https://placehold.co/800x600/e74c3c/ffffff?text=Kefaya+Musaken",
    featured: false,
    visible: true,
    openInNewTab: true
  }
];

const ARABIC_PROJECTS = COMMON_PROJECTS.map(p => ({
  ...p,
  title: p.title, // In a real scenario, translate these
  category: p.category === "Branding" ? "هوية بصرية" : p.category === "Social Media" ? "سوشيال ميديا" : p.category,
  description: "وصف كامل ومفصل للمشروع باللغة العربية..."
}));

const CONTENT_EN: PortfolioContent = {
  profile: {
    name: "Mohamed Khalid",
    title: "Graphic Designer",
    bio: "Passionate Graphic Designer with over 7 years of experience specializing in branding, social media designs, and visual identity. I combine artistic creativity with technical proficiency in Adobe Creative Suite and 3D software to deliver impactful visual solutions for clients like Carrefour, Botter Agency, and Mansoura University.",
    email: "mk77285@gmail.com",
    phone: "+201024361468",
    linkedin: "https://linkedin.com/in/mohamedka99",
    behance: "https://behance.net/mohamedka99",
    website: "https://Mohamedkha99.com",
    avatarUrl: "https://placehold.co/600x600/1C2A4A/FFFFFF?text=MK",
    externalPortfolioUrl: ""
  },
  skillCategories: [
    {
      id: "1",
      name: "Graphic Design",
      skills: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Branding", "Visual Identity", "Print Design"]
    },
    {
      id: "2",
      name: "Motion & Video",
      skills: ["Adobe After Effects", "Adobe Premiere Pro", "Video Editing", "Motion Graphics"]
    },
    {
      id: "3",
      name: "3D & Others",
      skills: ["Cinema 4D", "Maya", "Microsoft Office", "Creative Strategy"]
    }
  ],
  projects: COMMON_PROJECTS,
  experiences: [
    {
      id: "e1",
      role: "Freelance Graphic Designer",
      company: "Botter Agency",
      period: "2024 - Present",
      description: "Creating social media designs and visual content for agency clients."
    },
    {
      id: "e2",
      role: "Freelance Graphic Designer",
      company: "Frenzy Ice Cream",
      period: "2024 - Present",
      description: "Responsible for brand packaging, stickers, and promotional materials."
    },
    {
      id: "e3",
      role: "Graphic Designer (Remote)",
      company: "Carrefour Market - UAE",
      period: "2023 - Present",
      description: "Designing marketing visuals and campaigns for the UAE market."
    }
  ],
  education: [
    {
      id: "ed1",
      degree: "Pre-Master's in Design and Decoration",
      institution: "Faculty of Specific Education, Mansoura University",
      year: "2024"
    },
    {
      id: "ed2",
      degree: "Bachelor of Art Education",
      institution: "Faculty of Specific Education, Mansoura University",
      year: "2021",
      grade: "Very Good with Honors"
    }
  ],
  customSections: []
};

const CONTENT_AR: PortfolioContent = {
  profile: {
    name: "محمد خالد",
    title: "مصمم جرافيك",
    bio: "مصمم جرافيك شغوف بخبرة تزيد عن 7 سنوات، متخصص في العلامات التجارية، وتصاميم وسائل التواصل الاجتماعي، والهوية البصرية. أجمع بين الإبداع الفني والكفاءة التقنية في برامج Adobe وبرامج ثلاثية الأبعاد لتقديم حلول بصرية مؤثرة لعملاء مثل كارفور، ووكالة بوتر، وجامعة المنصورة.",
    email: "mk77285@gmail.com",
    phone: "+201024361468",
    linkedin: "https://linkedin.com/in/mohamedka99",
    behance: "https://behance.net/mohamedka99",
    website: "https://Mohamedkha99.com",
    avatarUrl: "https://placehold.co/600x600/1C2A4A/FFFFFF?text=م.خ",
    externalPortfolioUrl: ""
  },
  skillCategories: [
    {
      id: "1",
      name: "تصميم الجرافيك",
      skills: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "هوية بصرية", "تصميم مطبوعات"]
    },
    {
      id: "2",
      name: "الموشن والمونتاج",
      skills: ["Adobe After Effects", "Adobe Premiere Pro", "تحرير الفيديو", "موشن جرافيك"]
    },
    {
      id: "3",
      name: "ثلاثي الأبعاد وأخرى",
      skills: ["Cinema 4D", "Maya", "Microsoft Office", "استراتيجية إبداعية"]
    }
  ],
  projects: ARABIC_PROJECTS,
  experiences: [
    {
      id: "e1",
      role: "مصمم جرافيك حر",
      company: "وكالة Botter",
      period: "2024 - الحاضر",
      description: "إنشاء تصاميم وسائل التواصل الاجتماعي والمحتوى المرئي لعملاء الوكالة."
    },
    {
      id: "e2",
      role: "مصمم جرافيك حر",
      company: "Frenzy Ice Cream",
      period: "2024 - الحاضر",
      description: "مسؤول عن تصميم عبوات العلامة التجارية والملصقات والمواد الترويجية."
    },
    {
      id: "e3",
      role: "مصمم جرافيك (عن بعد)",
      company: "كارفور ماركت - الإمارات",
      period: "2023 - الحاضر",
      description: "تصميم المرئيات التسويقية والحملات لسوق الإمارات العربية المتحدة."
    }
  ],
  education: [
    {
      id: "ed1",
      degree: "تمهيدي ماجستير في التصميم والديكور",
      institution: "كلية التربية النوعية، جامعة المنصورة",
      year: "2024"
    },
    {
      id: "ed2",
      degree: "بكالوريوس التربية الفنية",
      institution: "كلية التربية النوعية، جامعة المنصورة",
      year: "2021",
      grade: "جيد جداً مع مرتبة الشرف"
    }
  ],
  customSections: []
};

export const INITIAL_DATA: PortfolioData = {
  en: CONTENT_EN,
  ar: CONTENT_AR
};

export const ADMIN_PASSWORD = "Mohamed77285";

export const TRANSLATIONS = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      work: "Work",
      contact: "Contact"
    },
    hero: {
      hello: "Hello, I'm",
      viewPortfolio: "View Portfolio",
      downloadCV: "Download CV"
    },
    about: {
      experience: "Experience",
      education: "Education",
      skills: "Skills"
    },
    portfolio: {
      title: "Selected Work",
      all: "All",
      noProjects: "No projects found in this category.",
      visitProject: "Visit Project",
      openLink: "Open Link"
    },
    contact: {
      title: "Let's work together",
      subtitle: "",
      emailBtn: "Email Me",
      callBtn: "Call:"
    },
    footer: {
      rights: "All rights reserved.",
      admin: "Admin Login"
    }
  },
  ar: {
    nav: {
      home: "الرئيسية",
      about: "عنّي",
      work: "أعمالي",
      contact: "تواصل معي"
    },
    hero: {
      hello: "مرحباً، أنا",
      viewPortfolio: "تصفح أعمالي",
      downloadCV: "تحميل السيرة الذاتية"
    },
    about: {
      experience: "الخبرات العملية",
      education: "التعليم",
      skills: "المهارات"
    },
    portfolio: {
      title: "مختارات من أعمالي",
      all: "الكل",
      noProjects: "لا توجد مشاريع في هذا القسم.",
      visitProject: "زيارة المشروع",
      openLink: "فتح الرابط"
    },
    contact: {
      title: "لنبدأ العمل معاً",
      subtitle: "",
      emailBtn: "راسلني",
      callBtn: "اتصل بي:"
    },
    footer: {
      rights: "جميع الحقوق محفوظة.",
      admin: "دخول المسؤول"
    }
  }
};