"use client";

import { useId, useState } from "react";
import { CalendarDays, Check, Mail, Repeat2, UserRound } from "lucide-react";

const stages = [
  {
    icon: Mail,
    fragmented: "Enquiry received",
    intentional: "Enquiry acknowledged",
  },
  {
    icon: UserRound,
    fragmented: "Ownership unclear",
    intentional: "Agent assigned",
  },
  {
    icon: Repeat2,
    fragmented: "Follow-up from memory",
    intentional: "Follow-up scheduled",
  },
  {
    icon: CalendarDays,
    fragmented: "Next step unknown",
    intentional: "Visible next step",
  },
] as const;

type WorkflowState = "fragmented" | "intentional";

export default function WorkflowComparison() {
  const [workflow, setWorkflow] = useState<WorkflowState>("fragmented");
  const diagramId = useId();

  return (
    <div className="workflow-demo" data-state={workflow}>
      <div className="workflow-toggle" role="group" aria-label="Compare the workflow">
        {(["fragmented", "intentional"] as const).map((state) => (
          <button
            key={state}
            className="workflow-toggle-button"
            type="button"
            aria-pressed={workflow === state}
            aria-controls={diagramId}
            onClick={() => setWorkflow(state)}
          >
            {state === "fragmented" ? "Fragmented" : "Intentional"}
          </button>
        ))}
      </div>

      <div id={diagramId} aria-live="polite" aria-atomic="true">
        <ol
          className="workflow-diagram"
          aria-label={`${workflow === "fragmented" ? "Fragmented" : "Intentional"} enquiry workflow`}
        >
          {stages.map((stage, index) => {
            const Icon = stage.icon;

            return (
              <li className="workflow-node" key={index}>
                <span className="workflow-node-icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.5} />
                </span>
                <span className="workflow-node-label">{stage[workflow]}</span>
                {index < stages.length - 1 && (
                  <span className="workflow-path" aria-hidden="true">
                    <span className="workflow-path-marker">
                      {workflow === "intentional" ? (
                        <Check size={11} strokeWidth={2} />
                      ) : (
                        "?"
                      )}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <p className="workflow-demo-footnote">
        Illustrative workflow. Your recommendations depend on your team’s actual process.
      </p>
    </div>
  );
}
