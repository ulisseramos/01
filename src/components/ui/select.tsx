import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { cn } from "../../lib/utils"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}

export function Select({ value, onValueChange, children, placeholder, className }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const selectedChild = React.Children.toArray(children)
    .find((child) =>
      React.isValidElement(child) && (child as React.ReactElement<{ value: string }>).props.value === value
    );
  const selectedLabel = React.isValidElement(selectedChild)
    ? (selectedChild as React.ReactElement<{ children: React.ReactNode }>).props.children
    : placeholder;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 'auto',
            minWidth: 180,
            padding: '12px 18px',
            background: '#020204',
            border: '1.5px solid #1A0938',
            borderRadius: 10,
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            boxShadow: '0 6px 32px 0 #0006',
            transition: 'border 0.2s, box-shadow 0.2s',
            outline: 'none',
            cursor: 'pointer',
          }}
          className={className}
        >
          <span>{selectedLabel}</span>
          <span style={{ marginLeft: 8, color: '#a78bfa', fontSize: 18 }}>▼</span>
        </button>
      </PopoverTrigger>
      <PopoverContent style={{
        padding: 0,
        width: 200,
        background: '#020204',
        border: '1.5px solid #1A0938',
        borderRadius: 14,
        boxShadow: '0 8px 32px 0 #000a',
        marginTop: 24,
        left: 96,
        position: 'relative',
      }}>
        <ul style={{ padding: 6, margin: 0, listStyle: 'none' }}>
          {React.Children.map(children, (child: any) =>
            React.cloneElement(child, {
              onSelect: (v: string) => {
                onValueChange(v)
                setOpen(false)
              },
              selected: value === child.props.value,
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  onSelect?: (value: string) => void
  selected?: boolean
}

export function SelectItem({ value, children, onSelect, selected }: SelectItemProps) {
  const [hover, setHover] = React.useState(false);
  return (
    <li>
      <button
        type="button"
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '12px 18px',
          borderRadius: 8,
          marginBottom: 4,
          fontWeight: selected ? 700 : 500,
          fontSize: 16,
          color: '#fff',
          background: selected
            ? '#2a2040'
            : hover
              ? '#3a2a60'
              : 'transparent',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          transition: 'background 0.18s, color 0.18s',
          fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => onSelect && onSelect(value)}
      >
        {children}
      </button>
    </li>
  )
}

export const SelectTrigger = React.Fragment
export const SelectContent = React.Fragment 