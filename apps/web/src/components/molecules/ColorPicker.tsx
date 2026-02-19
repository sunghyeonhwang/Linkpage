import { useState } from 'react';
import Input from '../atoms/Input';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const QUICK_COLORS = [
  '#FFFFFF', '#F9FAFB', '#F3F4F6', '#1F2937', '#111827', '#0F172A',
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#14B8A6', '#3B82F6', '#0EA5E9',
];

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-8 h-8 rounded-lg border border-gray-300 shadow-sm cursor-pointer"
          style={{ backgroundColor: value }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 font-mono text-xs"
        />
      </div>
      {showPicker && (
        <div className="grid grid-cols-8 gap-1.5 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
          {QUICK_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setShowPicker(false); }}
              className={`w-6 h-6 rounded border ${
                c === value ? 'ring-2 ring-primary-500 ring-offset-1' : 'border-gray-200'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
