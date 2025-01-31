'use client';

import { SectionHeader } from './SectionHeader';
import { ExperienceEntry } from './ExperienceEntry';
import { SkillSection } from './SkillSection';
import { mleExperiences, mleSkills } from '@/constants/content';

export const MLEContent = () => (
  <div className="space-y-4">
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
