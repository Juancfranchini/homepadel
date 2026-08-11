'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useState, useEffect, useCallback } from 'react';
import EditorToolbar from './EditorToolbar';
import EditorLinkInput from './EditorLinkInput';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

export function getFullUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_BASE + path;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlCode, setHtmlCode] = useState(content);

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension, LinkExtension.configure({ openOnClick: false }), Table, TableRow, TableCell, TableHeader, Underline, TextStyle, Color],
    content,
    onUpdate: ({ editor }) => {
      if (!isHtmlMode) {
        const html = editor.getHTML();
        setHtmlCode(html);
        onChange(html);
      }
    },
  });

  const toggleHtmlMode = useCallback(() => {
    if (!editor) return;
    if (isHtmlMode) {
      editor.commands.setContent(htmlCode);
      onChange(htmlCode);
    } else {
      setHtmlCode(editor.getHTML());
    }
    setIsHtmlMode(!isHtmlMode);
  }, [editor, isHtmlMode, htmlCode, onChange]);

  // Toolbar wrapper que en modo HTML inyecta etiquetas en el textarea
  const handleHtmlToolbarAction = (tag: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = htmlCode.substring(start, end);
    const wrapped = `<${tag}>${selectedText || 'texto'}</${tag}>`;
    const newCode = htmlCode.substring(0, start) + wrapped + htmlCode.substring(end);
    setHtmlCode(newCode);
    // Restaurar selección
    setTimeout(() => {
      textarea.focus();
      const newPos = start + wrapped.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  if (!editor) return <div className="h-40 bg-gray-50 rounded-lg animate-pulse" />;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <EditorToolbar
        editor={editor}
        showLinkInput={showLinkInput}
        setShowLinkInput={setShowLinkInput}
        isHtmlMode={isHtmlMode}
        onToggleHtml={toggleHtmlMode}
        onHtmlToolbarAction={handleHtmlToolbarAction}
      />
      {showLinkInput && !isHtmlMode && <EditorLinkInput editor={editor} onClose={() => setShowLinkInput(false)} />}
      
      {isHtmlMode ? (
        <textarea
          id="html-editor"
          value={htmlCode}
          onChange={(e) => setHtmlCode(e.target.value)}
          className="w-full min-h-[400px] p-4 font-mono text-sm bg-[#0f172a] text-[#C8FF00] focus:outline-none resize-y"
          placeholder="Escribe tu HTML aquí..."
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none text-gray-900" />
      )}
    </div>
  );
}