'use client';

interface Props {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export default function CatalogCheckboxOption({ label, checked, onChange }: Props) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className={'w-4 h-4 rounded border flex-none flex items-center justify-center transition-colors ' +
        (checked ? 'bg-[#B7D31A] border-[#B7D31A]' : 'border-[#8A8A85] group-hover:border-[#F7F6F7]')}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#050606" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      </div>
      <span className={'text-sm ' + (checked ? 'text-[#F7F6F7] font-semibold' : 'text-[#C7C7C0] group-hover:text-[#F7F6F7]') + ' transition-colors truncate'}>{label}</span>
    </label>
  );
}
