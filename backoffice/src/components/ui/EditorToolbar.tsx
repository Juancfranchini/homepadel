'use client';

import { useRef, useState } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon, Undo, Redo,
  Heading1, Heading2, Code, Quote, Globe, FileCode
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { getFullUrl } from './RichTextEditor';

interface Props {
  editor: Editor;
  showLinkInput: boolean;
  setShowLinkInput: (v: boolean) => void;
  onToggleHtml: () => void;
  isHtmlMode: boolean;
  onHtmlToolbarAction: (tag: string) => void;
}

export default function EditorToolbar({ editor, showLinkInput, setShowLinkInput, onToggleHtml, isHtmlMode, onHtmlToolbarAction }: Props) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/uploads/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.url || res.data?.imageUrl || '';
      editor.chain().focus().setImage({ src: getFullUrl(url) }).run();
      toast('Imagen subida', 'success');
    } catch {
      toast('Error al subir imagen', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addImageFromUrl = () => {
    const url = window.prompt('URL de la imagen:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const btn = 'p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors';
  const btnActive = 'p-1.5 rounded bg-[#C8FF00]/20 text-[#0f172a]';
  const sep = <span className="w-px h-5 bg-gray-300 mx-1" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <button type="button" onClick={() => isHtmlMode ? onHtmlToolbarAction('strong') : editor.chain().focus().toggleBold().run()} className={(!isHtmlMode && editor.isActive('bold')) ? btnActive : btn} title="Negrita"><Bold size={16} /></button>
      <button type="button" onClick={() => isHtmlMode ? onHtmlToolbarAction('em') : editor.chain().focus().toggleItalic().run()} className={(!isHtmlMode && editor.isActive('italic')) ? btnActive : btn} title="Cursiva"><Italic size={16} /></button>
      <button type="button" onClick={() => isHtmlMode ? onHtmlToolbarAction('u') : editor.chain().focus().toggleUnderline().run()} className={(!isHtmlMode && editor.isActive('underline')) ? btnActive : btn} title="Subrayado"><UnderlineIcon size={16} /></button>
      <button type="button" onClick={() => isHtmlMode ? onHtmlToolbarAction('s') : editor.chain().focus().toggleStrike().run()} className={(!isHtmlMode && editor.isActive('strike')) ? btnActive : btn} title="Tachado"><Strikethrough size={16} /></button>
      {sep}
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? btnActive : btn} title="Título 1"><Heading1 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? btnActive : btn} title="Título 2"><Heading2 size={16} /></button>
      {sep}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? btnActive : btn} title="Lista"><List size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? btnActive : btn} title="Lista numerada"><ListOrdered size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? btnActive : btn} title="Código"><Code size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? btnActive : btn} title="Cita"><Quote size={16} /></button>
      {sep}
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={btn} title="Subir imagen desde PC">{uploading ? '...' : <ImageIcon size={16} />}</button>
      <button type="button" onClick={addImageFromUrl} className={btn} title="Insertar imagen por URL"><Globe size={16} /></button>
      <button type="button" onClick={() => setShowLinkInput(!showLinkInput)} className={editor.isActive('link') ? btnActive : btn} title="Insertar enlace"><LinkIcon size={16} /></button>
      <button type="button" className={btn + ' opacity-30 cursor-not-allowed'} title="Tabla"><TableIcon size={16} /></button>
      {sep}
      <button type="button" onClick={onToggleHtml} className={isHtmlMode ? btnActive : btn} title="Modo HTML"><FileCode size={16} /></button>
      {sep}
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn} title="Deshacer"><Undo size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn} title="Rehacer"><Redo size={16} /></button>
    </div>
  );
}