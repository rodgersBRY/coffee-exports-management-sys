"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

type WorkspaceSection = {
  id: string;
  label: string;
  hint?: string;
  content: ReactNode;
};

type Props = {
  title: string;
  subtitle?: string;
  sections: WorkspaceSection[];
  defaultSectionId?: string;
};

export function ModuleWorkspace({
  title,
  subtitle,
  sections,
  defaultSectionId,
}: Props): React.JSX.Element {
  const initialSection = useMemo(() => {
    if (defaultSectionId && sections.some((section) => section.id === defaultSectionId)) {
      return defaultSectionId;
    }
    return sections[0]?.id ?? "";
  }, [defaultSectionId, sections]);

  const [activeId, setActiveId] = useState<string>(initialSection);
  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];

  return (
    <section className="module-workspace">
      <header className="module-workspace-header">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>

      <div className="module-workspace-tabs" role="tablist" aria-label={title}>
        {sections.map((section) => {
          const isActive = section.id === activeSection?.id;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`module-tab ${isActive ? "active" : ""}`}
              onClick={() => setActiveId(section.id)}
            >
              <span>{section.label}</span>
              {section.hint ? <small>{section.hint}</small> : null}
            </button>
          );
        })}
      </div>

      <div className="module-workspace-content" role="tabpanel">
        {activeSection?.content ?? <div className="alert info">No section configured.</div>}
      </div>
    </section>
  );
}
