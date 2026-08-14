import React from "react";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";
import { Check } from "lucide-react";

type MockStepperProps = {
  steps: string[];
  activeStep: number; // 0-indexed
};

export const MockStepper: React.FC<MockStepperProps> = ({
  steps,
  activeStep,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        fontFamily,
        padding: "8px 12px",
      }}
    >
      {steps.map((step, i) => {
        const isCompleted = i < activeStep;
        const isActive = i === activeStep;
        const isLast = i === steps.length - 1;

        return (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: isCompleted
                    ? COLORS.primary
                    : isActive
                      ? COLORS.primary
                      : COLORS.gray200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: isCompleted || isActive ? "#fff" : COLORS.gray500,
                }}
              >
                {isCompleted ? <Check size={12} strokeWidth={3} /> : i + 1}
              </div>
              {/* Label */}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? COLORS.gray900 : COLORS.gray500,
                  whiteSpace: "nowrap",
                }}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                style={{
                  width: 24,
                  height: 2,
                  background: isCompleted ? COLORS.primary : COLORS.gray200,
                  margin: "0 6px",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
