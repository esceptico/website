import { ReactNode } from 'react';

interface ListItemProps {
  children: ReactNode;
}

export const ListItem = ({ children }: ListItemProps) => (
  <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
    <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
    <span>{children}</span>
  </li>
); 