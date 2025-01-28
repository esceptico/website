'use client';

import { motion } from 'framer-motion';

export const MLEContent = ({ isDark }: { isDark: boolean }) => (
  <div className="space-y-4">
    <section>
      <p className="text-[var(--theme-text-secondary)]">
        As a Machine Learning Engineer specializing in Natural Language Processing, I focus on developing 
        and deploying large language models and generative AI solutions. With extensive experience in 
        model optimization, safety alignment, and scalable ML systems, I bridge the gap between research 
        and production applications.
      </p>
    </section>

    <section>
      <div className="relative group">
        <motion.div
          className="relative"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-bold mb-3 text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">Experience</h2>
        </motion.div>
      </div>
      <div className="space-y-8">
        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
          <motion.div 
            className="relative mb-2"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">Machine Learning Engineer (NLP)</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-0.5 tracking-wide">Replika • Oct 2022 - Present</p>
          </motion.div>
          <ul className="space-y-2">
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Ensure scalability and reliability of high-load LLM-based services</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Lead safety alignment to ensure models operate within desired parameters</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Work on user alignment data mining and model training</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Implement safety benchmarks for continuous monitoring and improvement</span>
            </li>
          </ul>
        </div>

        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
          <motion.div 
            className="relative mb-2"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">Machine Learning Engineer (NLP)</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-0.5 tracking-wide">Embedika • Feb 2022 - Sep 2022</p>
          </motion.div>
          <ul className="space-y-2">
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Completed an active learning service on multi-modal data</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Introduced toxic classifier service achieving 94% F1-Score</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Implemented and deployed spellchecking service using BERT and PyTorch Lightning</span>
            </li>
          </ul>
        </div>

        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
          <motion.div 
            className="relative mb-2"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">Machine Learning Engineer</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-0.5 tracking-wide">Sberbank • May 2021 - Feb 2022</p>
          </motion.div>
          <ul className="space-y-2">
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Led a team of 4 engineers and onboarded 3 new hires</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Optimized models through distillation and ONNX, reducing inference time by 80%</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Reduced NER models development time by 50% with custom Transformers pipeline</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Designed model showcase system reducing time to production by 15-20%</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Established CI/CD pipelines for automatic testing and deployment</span>
            </li>
          </ul>
        </div>

        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
          <motion.div 
            className="relative mb-2"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">Data Scientist</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-0.5 tracking-wide">Sberbank • Jan 2020 - May 2021</p>
          </motion.div>
          <ul className="space-y-2">
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Developed multi-target text classification model achieving 93% F1-Score</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Enhanced model robustness by 4% using Integrated Gradients and adversarial training</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Improved NER model performance by 5% through advanced token vectorization</span>
            </li>
          </ul>
        </div>

        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
          <motion.div 
            className="relative mb-2"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">Data Scientist</h3>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-0.5 tracking-wide">Advance.Careers • Aug 2018 - Jul 2019</p>
          </motion.div>
          <ul className="space-y-2">
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Built resume and job posting parsing systems improving CV upload rate by 10%</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Enhanced job matching score by 10% using Smooth Inverse Frequency vectorization</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Reduced time to apply by 8% through system optimizations</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <div className="relative group">
        <motion.div
          className="relative"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-bold mb-3 text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">Skills</h2>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <h3 className="font-semibold mb-1.5 text-[var(--theme-text-primary)]">Core</h3>
          <ul className="list-disc list-inside text-[var(--theme-text-secondary)]">
            <li>LLM Development</li>
            <li>NLP & Text Processing</li>
            <li>Model Optimization</li>
            <li>Safety Alignment</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-1.5 text-[var(--theme-text-primary)]">Technologies</h3>
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