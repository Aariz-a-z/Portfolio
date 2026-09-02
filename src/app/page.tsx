import { About } from '@/components/about/About';
import { ContactSection } from '@/components/contact/ContactSection';
import { EducationSection } from '@/components/education/EducationSection';
import { Hero } from '@/components/hero/Hero';
import { RevealAll } from '@/components/layout/Reveal';
import { Section } from '@/components/layout/Section';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { SkillsSection } from '@/components/skills/SkillsSection';

/**
 * Section order is the argument the page makes: what he does, then the proof,
 * then the range, then the vocabulary, then the person, then the credential,
 * then how to reach him.
 *
 * Skills sit after the projects on purpose — a skill list before any evidence
 * reads as a claim; after it, it reads as a summary of what was just shown.
 */
export default function HomePage() {
  return (
    <>
      <RevealAll />
      <Hero />

      <Section
        id="work"
        index="01"
        title="Featured work"
        intro="The two projects I would want to be asked about."
      >
        <ProjectsSection tier="flagship" />
      </Section>

      <Section
        id="projects"
        index="02"
        title="Machine learning & web projects"
        intro="Datasets, models and interfaces built while working through the fundamentals."
      >
        <ProjectsSection tier="standard" />
      </Section>

      <Section
        id="fundamentals"
        index="03"
        title="Python fundamentals"
        intro="Early command-line programs, kept here because they are where the habits started."
      >
        <ProjectsSection tier="compact" />
      </Section>

      <Section
        id="skills"
        index="04"
        title="Skills"
        intro="Everything listed here is used in a project above."
      >
        <SkillsSection />
      </Section>

      <Section id="about" index="05" title="About">
        <About />
      </Section>

      <Section id="education" index="06" title="Education">
        <EducationSection />
      </Section>

      <Section id="contact" index="07" title="Contact" last>
        <ContactSection />
      </Section>
    </>
  );
}
