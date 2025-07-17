import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }} className={className}>
        <input
          ref={ref}
          type="checkbox"
          style={{
            width: 18,
            height: 18,
            accentColor: '#6366f1',
            borderRadius: 4,
            border: '1.5px solid #222',
            margin: 0,
            marginRight: 6,
            cursor: 'pointer',
          }}
          {...props}
        />
        {label && <span style={{ fontSize: 16, color: '#fff' }}>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox'; 