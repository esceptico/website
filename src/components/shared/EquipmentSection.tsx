import { motion } from 'framer-motion';

interface Equipment {
  title: string;
  items: string[];
}

interface EquipmentSectionProps {
  equipment: Equipment;
}

export const EquipmentSection = ({ equipment }: EquipmentSectionProps) => (
  <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
    <motion.div 
      className="relative mb-2"
      initial={{ opacity: 0.8 }}
      whileHover={{ opacity: 1 }}
    >
      <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">
        {equipment.title}
      </h3>
    </motion.div>
    <ul className="space-y-2">
      {equipment.items.map((item, index) => (
        <li 
          key={index}
          className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200"
        >
          <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
); 