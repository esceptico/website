'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  as?: 'h1' | 'h2' | 'h3';
  variant?: 'primary' | 'secondary';
}

export const SectionHeader = ({ title, as = 'h2', variant = 'secondary' }: SectionHeaderProps) => {
  const baseClasses = "text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200";
  const variantClasses = {
    primary: "text-4xl font-light",
    secondary: "text-2xl font-bold mb-3"
  };

  const Component = as;

  return (
    <div className="relative group">
      <motion.div
        className="relative"
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
      >
        <Component className={`${baseClasses} ${variantClasses[variant]}`}>
          {title}
        </Component>
      </motion.div>
    </div>
  );
}; 
