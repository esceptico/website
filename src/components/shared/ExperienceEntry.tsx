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
  isHovered?: boolean;
  isDimmed?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

export const ExperienceEntry = ({ 
  company, 
  roles, 
  isHovered = false,
  isDimmed = false,
  onHover,
  onLeave 
}: ExperienceEntryProps) => {
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
    <div 
      className={`mb-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isDimmed ? 'opacity-25 blur-[0.9px]' : 'opacity-100 blur-0'
      } ${isHovered ? 'opacity-100 blur-0' : ''}`}
      style={{ willChange: 'opacity, filter' }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <h3 className="text-lg font-medium text-[var(--theme-text-primary)] mb-2">
        {company}
      </h3>
      <div className="space-y-1">
        {roles.map((role, index) => (
          <div key={index}>
            <div 
              className="flex justify-between items-center rounded px-2 py-1 -mx-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer group"
              onClick={() => toggleRole(index)}
            >
              <span className={`text-sm text-[var(--theme-text-secondary)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedRoles.has(index) 
                  ? 'opacity-100' 
                  : 'opacity-60 hover:opacity-80'
              }`}>
                {role.period}
              </span>
              <span className={`text-base text-[var(--theme-text-primary)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedRoles.has(index) ? 'translate-x-0' : 'group-hover:translate-x-1'
              }`}>
                {role.title}
              </span>
            </div>
            <div 
              className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedRoles.has(index) ? 'max-h-40' : 'max-h-0'
              }`}
            >
              <div className={`pt-2 pb-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
                expandedRoles.has(index) 
                  ? 'opacity-70 translate-y-0' 
                  : 'opacity-0 -translate-y-2'
              }`}>
                <p className="text-base text-[var(--theme-text-secondary)] leading-relaxed pl-2 border-l-2 border-[var(--theme-border)] border-opacity-30">
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
