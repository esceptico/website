'use client';

import { SectionHeader } from './SectionHeader';
import { ExperienceEntry } from './ExperienceEntry';
import { SkillSection } from './SkillSection';
import { mleExperiences, mleSkills } from '@/constants/content';

export const MLEContent = () => (
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
      <SectionHeader title="Experience" />
      <div className="space-y-8">
        {mleExperiences.map((experience, index) => (
          <ExperienceEntry key={index} {...experience} />
        ))}
      </div>
    </section>

    <section>
      <SectionHeader title="Skills" />
      <div className="grid grid-cols-2 gap-6">
        <SkillSection title="Core" skills={mleSkills.core} />
        <SkillSection title="Technologies" skills={mleSkills.technologies} />
      </div>
    </section>
  </div>
); 
