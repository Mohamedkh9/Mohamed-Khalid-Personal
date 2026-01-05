import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dir?: 'rtl' | 'ltr';
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className, dir }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
        onChange(contentRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== value) {
        if (document.activeElement !== contentRef.current) {
             contentRef.current.innerHTML = value;
        }
    }
  }, [value]);

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white group focus-within:ring-2 focus-within:ring-[#3B82F6] focus-within:border-transparent transition-all shadow-sm ${className}`}>
      <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50 text-gray-600" dir="ltr">
        <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-2 hover:bg-white hover:text-primary hover:shadow-sm rounded-lg transition-all"
            title="Bold"
        >
            <Bold size={18} />
        </button>
        <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-2 hover:bg-white hover:text-primary hover:shadow-sm rounded-lg transition-all"
            title="Italic"
        >
            <Italic size={18} />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 hover:bg-white hover:text-primary hover:shadow-sm rounded-lg transition-all"
            title="Bullet List"
        >
            <List size={18} />
        </button>
        <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 hover:bg-white hover:text-primary hover:shadow-sm rounded-lg transition-all"
            title="Numbered List"
        >
            <ListOrdered size={18} />
        </button>
      </div>
      <div
        ref={contentRef}
        className="p-4 min-h-[150px] outline-none prose prose-sm max-w-none text-gray-700 bg-white cursor-text focus:outline-none"
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        dir={dir}
        data-placeholder={placeholder}
        style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr', textAlign: dir === 'rtl' ? 'right' : 'left' }}
      />
    </div>
  );
};