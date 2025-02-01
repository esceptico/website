import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-6 border-t border-gray-800/10 dark:border-gray-100/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="https://github.com/esceptico" 
              target="_blank"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="GitHub"
            >
              <FaGithub className="w-6 h-6" />
            </Link>
            <Link 
              href="https://linkedin.com/in/esceptico" 
              target="_blank"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="w-6 h-6" />
            </Link>
            <a 
              href="mailto:ganiev.tmr@gmail.com"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Email"
            >
              <FaEnvelope className="w-6 h-6" />
            </a>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>© {currentYear} postmort3m.io</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
