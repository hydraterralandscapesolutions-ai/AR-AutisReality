import { usePageTitle } from '../hooks/usePageTitle'
import './Resources.css'

export interface ResourceCard {
  id: string
  title: string
  emoji: string
  body: string
  tag: string
}

export const RESOURCES: ResourceCard[] = [
  {
    id: 'understanding-autism',
    title: 'Understanding Autism Spectrum',
    emoji: '🧩',
    tag: 'Foundational',
    body: 'Autism spectrum disorder (ASD) is a complex developmental condition involving persistent challenges with social communication, restricted interests, and repetitive behavior. Every autistic person is unique – learning the spectrum\'s nuances helps you support your child\'s individual strengths.',
  },
  {
    id: 'communication-strategies',
    title: 'Communication Strategies',
    emoji: '💬',
    tag: 'Communication',
    body: 'From visual schedules and AAC devices to PECS and social stories, a wide range of tools can bridge communication gaps. Meeting your child where they are – verbal or non-verbal – fosters connection and reduces frustration for both of you.',
  },
  {
    id: 'sensory-sensitivities',
    title: 'Sensory Sensitivities',
    emoji: '🌊',
    tag: 'Sensory',
    body: 'Many autistic children experience heightened or reduced sensitivity to light, sound, texture, taste, and touch. Creating a sensory-friendly environment and identifying triggers can significantly improve comfort, behavior, and quality of life.',
  },
  {
    id: 'daily-routines',
    title: 'Building Daily Routines',
    emoji: '📅',
    tag: 'Structure',
    body: 'Predictable routines provide safety and comfort. Visual timetables, transition warnings, and consistent schedules help children manage anxiety and develop independence. Small, consistent steps lead to meaningful long-term progress.',
  },
  {
    id: 'finding-support',
    title: 'Finding Support Networks',
    emoji: '🤝',
    tag: 'Community',
    body: 'You are not alone. Support groups, therapists specialising in ASD, respite care services, and online communities offer guidance, empathy, and practical help. Connecting with other families walking a similar path can be life-changing.',
  },
]

export default function Resources() {
  usePageTitle('Resources')

  return (
    <div className="page">
      <h1 className="page-title">📚 Parent Resources</h1>
      <p className="page-subtitle">
        Evidence-informed guidance to help you understand and support your autistic child.
      </p>

      <div className="resources-grid" role="list">
        {RESOURCES.map(resource => (
          <article
            key={resource.id}
            className="resource-card card"
            role="listitem"
            aria-labelledby={`res-title-${resource.id}`}
          >
            <div className="resource-card__header">
              <span className="resource-card__emoji" aria-hidden="true">{resource.emoji}</span>
              <span className="resource-card__tag">{resource.tag}</span>
            </div>
            <h2 id={`res-title-${resource.id}`} className="resource-card__title">
              {resource.title}
            </h2>
            <p className="resource-card__body">{resource.body}</p>
            <a
              href="#"
              className="btn btn-outline resource-card__link"
              aria-label={`Learn more about ${resource.title}`}
              onClick={e => e.preventDefault()}
            >
              Learn More →
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
