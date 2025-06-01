'use client';

import { useState } from 'react';

interface Role {
  title: string;
  period: string;
  summary: string;
}

interface ExperienceEntryProps {
  company: string;
  roles: Role[];
}

export const ExperienceEntry = ({ company, roles }: ExperienceEntryProps) => {
  const [expandedRoles, setExpandedRoles] = useState<Set<number>>(new Set());

  const toggleRole = (index: number) => {
    const newExpandedRoles = new Set(expandedRoles);
    if (newExpandedRoles.has(index)) {
      newExpandedRoles.delete(index);
    } else {
      newExpandedRoles.add(index);
    }
    setExpandedRoles(newExpandedRoles);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-[var(--theme-text-primary)] mb-2">
        {company}
      </h3>
      <div className="space-y-1">
        {roles.map((role, index) => (
          <div key={index}>
            <div 
              className="flex justify-between items-center hover:bg-[var(--theme-border)] hover:bg-opacity-10 rounded px-2 py-1 -mx-2 transition-all duration-150 cursor-pointer"
              onClick={() => toggleRole(index)}
            >
              <span className={`text-sm text-[var(--theme-text-secondary)] transition-all duration-300 ${
                expandedRoles.has(index) 
                  ? 'opacity-100 border-l-2 border-[var(--theme-text-primary)] pl-2 -ml-2' 
                  : 'opacity-60'
              }`}>
                {role.period}
              </span>
              <span className="text-base text-[var(--theme-text-primary)]">
                {role.title}
              </span>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedRoles.has(index) ? 'max-h-32 opacity-70 mb-3' : 'max-h-0 opacity-0'
            }`}>
              <div className="mt-1 pt-1">
                <p className="text-base text-[var(--theme-text-secondary)] leading-relaxed">
                  {role.summary}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
