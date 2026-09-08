'use client';

interface Props {
  checked: boolean;
  onChange: () => void;
}

export default function Toggle({ checked, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ' +
        (checked ? 'bg-[#C8FF00]' : 'bg-gray-200')}
    >
      <span
        className={'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ' +
          (checked ? 'translate-x-6' : 'translate-x-1')}
      />
    </button>
  );
}