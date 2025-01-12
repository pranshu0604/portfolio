'use client'
import { useEffect, useState } from 'react';

interface Section {
  id: number;
  label: string;
  content: string;
}

// Move sections array outside the component to avoid creating a new reference on each render
const sections: Section[] = [
  { id: 1, label: 'Flexible', content: 'Section 1 content' },
  { id: 2, label: 'Scalable', content: 'Section 2 content' },
  { id: 3, label: 'Modern', content: 'Section 3 content' },
  { id: 4, label: 'Efficient', content: 'Section 4 content' },
  { id: 5, label: 'Responsive', content: 'Section 5 content' },
  { id: 6, label: 'Accessible', content: 'Section 6 content' },
];

const CircularScrollSpy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(0);
  const [observers, setObservers] = useState<IntersectionObserver[]>([]);

  const getBaseAngle = (index: number, total: number): number => {
    return (index * 360) / total;
  };

  const getNavItemPosition = (index: number, total: number) => {
    const radius = 120;
    const angleStep = (2 * Math.PI) / total;
    const angle = angleStep * index - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    let degrees = (angle * 180) / Math.PI;
    const shouldFlip = degrees > 90 || degrees < -90;
    const textRotation = shouldFlip ? degrees + 180 : degrees;

    return {
      transform: `translate(${x}px, ${y}px)`,
      textRotation,
      shouldFlip,
    };
  };

  const getCircleRotation = (): number => {
    const baseAngle = getBaseAngle(activeSection, sections.length);
    return -baseAngle;
  };

  useEffect(() => {
    // Clean up previous observers
    observers.forEach((observer) => observer.disconnect());

    const newObservers = sections.map((section, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(index);
            }
          });
        },
        {
          threshold: 0.5,
          rootMargin: '-50% 0px -50% 0px',
        }
      );

      const element = document.getElementById(`section-${section.id}`);
      if (element) observer.observe(element);
      return observer;
    });

    setObservers(newObservers);

    return () => {
      newObservers.forEach((observer) => observer.disconnect());
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  const scrollToSection = (id: number): void => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="fixed right-32 top-1/2 -translate-y-1/2 w-[240px] h-[240px] flex items-center justify-center">
        <div
          className="absolute w-full h-full transition-transform duration-500 ease-in-out"
          style={{
            transform: `rotate(${getCircleRotation()}deg)`,
            transformOrigin: '120px 120px',
          }}
        >
          {/* Visual circle guide */}
          <div className="absolute inset-0 border-2 border-gray-200 rounded-full" />

          {sections.map((section, index) => {
            const { transform, textRotation, shouldFlip } = getNavItemPosition(index, sections.length);

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{ transform }}
              >
                <div
                  className={`flex items-center gap-2 transition-transform duration-500 ease-in-out ${
                    shouldFlip ? 'flex-row-reverse' : 'flex-row'
                  } ${
                    activeSection === index
                      ? 'text-blue-600 scale-110'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  style={{
                    transform: `rotate(${textRotation}deg)`,
                  }}
                >
                  <span className="text-sm font-mono">
                    {String(section.id).padStart(2, '0')}
                  </span>
                  <span className="font-medium">{section.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content sections */}
      <div className="max-w-2xl mx-auto px-4">
        {sections.map((section) => (
          <section
            key={section.id}
            id={`section-${section.id}`}
            className="min-h-screen flex items-center justify-center"
          >
            <h2 className="text-4xl font-bold">{section.label}</h2>
            <p>{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default CircularScrollSpy;