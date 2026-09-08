'use client';

import { useState } from 'react';
import { type Editor } from '@tiptap/react';

interface Props {
  editor: Editor;
  onClose: () => void;
}

export default function EditorLinkInput({ editor, onClose }: Props) {
  const [url, setUrl] = useState('');

  const addLink = () => {
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setUrl('');
    onClose();
  };

  return (
    <div className="flex gap-2 p-2 bg-gray-50 border-b border-gray-200">
      <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" />
      <button type="button" onClick={addLink} className="px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded text-xs font-semibold">OK</button>
      <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); onClose(); }} className="px-2 py-1 text-gray-500 rounded text-xs">Quitar</button>
    </div>
  );
}