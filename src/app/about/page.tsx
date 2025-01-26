'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { BeakerIcon, CameraIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const MLEContent = ({ isDark }: { isDark: boolean }) => (
  <div className="space-y-6">
    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        Background
      </h2>
      <p className="text-[var(--theme-text-secondary)]">
        As a Machine Learning Engineer specializing in Natural Language Processing, I focus on developing 
        and deploying large language models and generative AI solutions. With extensive experience in 
        model optimization, safety alignment, and scalable ML systems, I bridge the gap between research 
        and production applications.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">Experience</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-[var(--theme-text-primary)]">Machine Learning Engineer (NLP)</h3>
          <p className="text-[var(--theme-text-secondary)]">Replika • Oct 2022 - Present</p>
          <p className="text-[var(--theme-text-secondary)]">
            Leading LLM development with focus on safety alignment and scalability. Working on user alignment 
            data mining and implementing comprehensive safety benchmarks. Ensuring scalability and reliability 
            of high-load LLM-based services.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-[var(--theme-text-primary)]">Machine Learning Engineer (NLP)</h3>
          <p className="text-[var(--theme-text-secondary)]">Embedika • Feb 2022 - Sep 2022</p>
          <p className="text-[var(--theme-text-secondary)]">
            Completed an active learning service on multi-modal data. Introduced toxic classifier service with 94% F1-Score. 
            Implemented and deployed spellchecking service using BERT and PyTorch Lightning.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-[var(--theme-text-primary)]">Machine Learning Engineer</h3>
          <p className="text-[var(--theme-text-secondary)]">Sberbank • May 2021 - Feb 2022</p>
          <p className="text-[var(--theme-text-secondary)]">
            Led ML team of 4 engineers, optimized model inference by 80% through distillation and ONNX. 
            Reduced NER models development time by 50% with custom pipeline. Designed model showcase system 
            and established efficient development workflows.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-[var(--theme-text-primary)]">Data Scientist</h3>
          <p className="text-[var(--theme-text-secondary)]">Sberbank • Jan 2020 - May 2021</p>
          <p className="text-[var(--theme-text-secondary)]">
            Developed multi-target text classification model achieving 93% F1-Score. Enhanced model robustness 
            using Integrated Gradients and adversarial training. Improved NER model performance through 
            advanced token vectorization.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-[var(--theme-text-primary)]">Data Scientist</h3>
          <p className="text-[var(--theme-text-secondary)]">Advance.Careers • Aug 2018 - Jul 2019</p>
          <p className="text-[var(--theme-text-secondary)]">
            Built resume and job posting parsing systems improving CV upload rate by 10%. Enhanced job matching 
            score by 10% using Smooth Inverse Frequency document vectorization.
          </p>
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