'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { BeakerIcon, CameraIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const MLEContent = ({ isDark }: { isDark: boolean }) => (
  <div className="space-y-6">
    <section>
      <p className="text-[var(--theme-text-secondary)]">
        As a Machine Learning Engineer specializing in Natural Language Processing, I focus on developing 
        and deploying large language models and generative AI solutions. With extensive experience in 
        model optimization, safety alignment, and scalable ML systems, I bridge the gap between research 
        and production applications.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">Experience</h2>
      <div className="space-y-12">
        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20">
          <div className="relative mb-4">
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)]">Machine Learning Engineer (NLP)</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1 tracking-wide">Replika • Oct 2022 - Present</p>
          </div>
          <ul className="space-y-3">
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Ensure scalability and reliability of high-load LLM-based services</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Lead safety alignment to ensure models operate within desired parameters</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Work on user alignment data mining and model training</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Implement safety benchmarks for continuous monitoring and improvement</span>
            </li>
          </ul>
        </div>

        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20">
          <div className="relative mb-4">
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)]">Machine Learning Engineer (NLP)</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1 tracking-wide">Embedika • Feb 2022 - Sep 2022</p>
          </div>
          <ul className="space-y-3">
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Completed an active learning service on multi-modal data</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Introduced toxic classifier service achieving 94% F1-Score</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Implemented and deployed spellchecking service using BERT and PyTorch Lightning</span>
            </li>
          </ul>
        </div>

        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20">
          <div className="relative mb-4">
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)]">Machine Learning Engineer</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1 tracking-wide">Sberbank • May 2021 - Feb 2022</p>
          </div>
          <ul className="space-y-3">
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Led a team of 4 engineers and onboarded 3 new hires</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Optimized models through distillation and ONNX, reducing inference time by 80%</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Reduced NER models development time by 50% with custom Transformers pipeline</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Designed model showcase system reducing time to production by 15-20%</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Established CI/CD pipelines for automatic testing and deployment</span>
            </li>
          </ul>
        </div>

        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20">
          <div className="relative mb-4">
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)]">Data Scientist</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1 tracking-wide">Sberbank • Jan 2020 - May 2021</p>
          </div>
          <ul className="space-y-3">
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Developed multi-target text classification model achieving 93% F1-Score</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Enhanced model robustness by 4% using Integrated Gradients and adversarial training</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Improved NER model performance by 5% through advanced token vectorization</span>
            </li>
          </ul>
        </div>

        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20">
          <div className="relative mb-4">
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)]">Data Scientist</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1 tracking-wide">Advance.Careers • Aug 2018 - Jul 2019</p>
          </div>
          <ul className="space-y-3">
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Built resume and job posting parsing systems improving CV upload rate by 10%</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Enhanced job matching score by 10% using Smooth Inverse Frequency vectorization</span>
            </li>
            <li className="group flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3"></span>
              <span>Reduced time to apply by 8% through system optimizations</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        Skills
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2 text-[var(--theme-text-primary)]">
            Core
          </h3>
          <ul className="list-disc list-inside text-[var(--theme-text-secondary)]">
            <li>LLM Development</li>
            <li>NLP & Text Processing</li>
            <li>Model Optimization</li>
            <li>Safety Alignment</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-[var(--theme-text-primary)]">
            Technologies
          </h3>
          <ul className="list-disc list-inside text-[var(--theme-text-secondary)]">
            <li>PyTorch</li>
            <li>Transformers</li>
            <li>ONNX</li>
            <li>Python</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
);

const PhotographyContent = ({ isDark }: { isDark: boolean }) => (
  <div className="space-y-6">
    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        About My Photography
      </h2>
      <p className="text-[var(--theme-text-secondary)]">
        Photography is my creative outlet where I explore visual storytelling through both digital 
        and analog mediums. I focus on capturing authentic moments and unique perspectives, 
        combining technical precision with artistic vision.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        Equipment
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2 text-[var(--theme-text-primary)]">
            Camera
          </h3>
          <ul className="list-disc list-inside text-[var(--theme-text-secondary)]">
            <li>Fujifilm X-T5</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-[var(--theme-text-primary)]">
            Lenses
          </h3>
          <ul className="list-disc list-inside text-[var(--theme-text-secondary)]">
            <li>Fujinon 18-55mm f/2.8</li>
            <li>Fujinon 35mm f/2</li>
            <li>Voigtlander 35mm f/1.2</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        Style & Approach
      </h2>
      <p className="text-[var(--theme-text-secondary)]">
        My photographic style emphasizes natural light and thoughtful composition. I believe in 
        capturing authentic moments while maintaining technical excellence, whether shooting 
        street photography, portraits, or landscapes.
      </p>
    </section>
  </div>
);

export default function About() {
  const { mode, colorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8"
      >
        <h1 className={`text-4xl font-light mb-8 ${
          mode === 'mle'
            ? 'text-[var(--theme-accent-primary)]'
            : 'text-[var(--theme-accent-primary)]'
        }`}>
          About Me
        </h1>
        {mode === 'mle' ? <MLEContent isDark={isDark} /> : <PhotographyContent isDark={isDark} />}
      </motion.div>
    </div>
  );
} 