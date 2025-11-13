"use client";

import { useState } from 'react';

type AccordionProps = {
  title: string;
  children: React.ReactNode;
};

const headerStyles: React.CSSProperties = {
  backgroundColor: '#fffbee',
  padding: '20px 10px',
  cursor: 'pointer',
  fontSize: '3em',
  position: 'relative',
  borderTop: '2px solid black',
  borderBottom: '2px solid black',
  marginTop: '20px',
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const contentStyles: React.CSSProperties = {
  padding: '10px',
  backgroundColor: '#fffbee',
};

export default function Accordion({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div style={headerStyles} onClick={() => setIsOpen(!isOpen)}>
        {title}
        <span style={{ transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▾
        </span>
      </div>
      {isOpen && <div style={contentStyles}>{children}</div>}
    </div>
  );
}