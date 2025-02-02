import { motion } from 'framer-motion';
import { ListItem } from './ListItem';

interface ExperienceEntryProps {
  title: string;
  company: string;
  period: string;
  achievements: string[];
}

export const ExperienceEntry = ({ title, company, period, achievements }: ExperienceEntryProps) => (
  <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
    <motion.div 
      className="relative mb-2"
      initial={{ opacity: 0.8 }}
      whileHover={{ opacity: 1 }}
    >
      <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">{title}</h3>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-sm font-medium text-[var(--theme-text-primary)]">{company}</span>
        <span className="text-sm text-[var(--theme-text-secondary)] tracking-wide">{period}</span>
      </div>
    </motion.div>
    <ul className="space-y-2">
      {achievements.map((achievement, index) => (
        <ListItem key={index}>{achievement}</ListItem>
      ))}
    </ul>
  </div>
); 