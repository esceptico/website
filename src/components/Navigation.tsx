'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/theme';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const mleLinks = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/publications', label: 'Publications' },
];

const photographyLinks = [
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/behind-the-scenes', label: 'Stories' },
];

const navVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    }
  },
};

const linkVariants = {
  hidden: { y: -10, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  hover: { 
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.95 }
};

export default function Navigation() {
  const { mode } = useThemeStore();
  const pathname = usePathname();
  const links = mode === 'mle' ? mleLinks : photographyLinks;
  const activeColor = mode === 'mle' ? 'rgb(79, 70, 229)' : 'rgb(217, 119, 6)';

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm"
    >
      <nav className="mx-auto px-4 sm:px-8 lg:px-12">
        <div className="h-20 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/"
              className="text-base font-light tracking-wide hover:opacity-70 transition-opacity"
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden sm:inline"
              >
                Firstname
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="sm:hidden"
              >
                F.
              </motion.span>
              {' '}
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="font-normal"
              >
                Lastname
              </motion.span>
            </Link>
          </motion.div>

          <div className="flex items-center gap-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="hidden md:flex items-center gap-6"
              >
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                    custom={i}
                  >
                    <Link
                      href={link.href}
                      className="relative py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <span>{link.label}</span>
                      {pathname === link.href && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute left-0 right-0 bottom-0 h-px"
                          style={{ backgroundColor: activeColor }}
                          transition={{ 
                            type: "spring", 
                            bounce: 0.25, 
                            duration: 0.5,
                            stiffness: 300,
                            damping: 25
                          }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4 }}
              className="h-8 w-px bg-gray-200 hidden md:block"
            />
            
            <ThemeToggle />
          </div>
        </div>
      </nav>
      
      <motion.div 
        className="h-px w-full"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ 
          scaleX: 1, 
          opacity: 0.25,
          transition: { delay: 0.5, duration: 0.8 }
        }}
        style={{
          background: mode === 'mle'
            ? 'linear-gradient(90deg, transparent 0%, rgb(79, 70, 229) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgb(217, 119, 6) 50%, transparent 100%)',
          transformOrigin: 'center'
        }}
      />
    </motion.header>
  );
} 