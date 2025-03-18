import React from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

interface PriceRange {
  min: number;
  max: number;
  label: string;
}

interface PriceRangeSliderProps {
  value: PriceRange;
  onChange: (range: PriceRange) => void;
}

const priceRanges: PriceRange[] = [
  { min: 0, max: 0, label: '무료' },
  { min: 0, max: 20000, label: '2만원 이하' },
  { min: 0, max: 30000, label: '3만원 이하' },
  { min: 0, max: 50000, label: '5만원 이하' },
  { min: 0, max: 100000, label: '10만원 이하' },
  { min: 0, max: Infinity, label: '전체' },
];

export function PriceRangeSlider({ value, onChange }: PriceRangeSliderProps) {
  return (
    <div className="relative w-full md:w-48">
      <Listbox value={value} onChange={onChange}>
        <Listbox.Button className="relative w-full py-2 pl-4 pr-10 text-left bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
          <span className="block truncate">{value.label}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto bg-white rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none">
          {priceRanges.map((range) => (
            <Listbox.Option
              key={range.label}
              value={range}
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                  active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                }`
              }
            >
              {range.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}