import React from "react";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";

type MockFormFieldProps = {
  label: string;
  placeholder?: string;
  value?: string;
  width?: string | number;
};

export const MockFormField: React.FC<MockFormFieldProps> = ({
  label,
  placeholder = "",
  value,
  width = "100%",
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width,
        fontFamily,
      }}
    >
      <label
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: COLORS.gray600,
        }}
      >
        {label}
      </label>
      <div
        style={{
          height: 28,
          borderRadius: 6,
          border: `1px solid ${COLORS.gray200}`,
          background: COLORS.surfaceWhite,
          padding: "0 8px",
          display: "flex",
          alignItems: "center",
          fontSize: 11,
          color: value ? COLORS.gray900 : COLORS.gray500,
        }}
      >
        {value || placeholder}
      </div>
    </div>
  );
};
