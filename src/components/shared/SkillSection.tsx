import { motion } from 'framer-motion';
import { ListItem } from '@/components/shared/ListItem';

interface SkillSectionProps {
  title: string;
  skills: string[];
}

export const SkillSection = ({ title, skills }: SkillSectionProps) => (
  <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
    <motion.div 
      className="relative mb-2"
      initial={{ opacity: 0.8 }}
      whileHover={{ opacity: 1 }}
    >
      <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">{title}</h3>
    </motion.div>
    <ul className="space-y-2">
      {skills.map((skill, index) => (
        <ListItem key={index}>{skill}</ListItem>
      ))}
    </ul>
  </div>
);
