"use client";

import { useState } from 'react';
import styles from './DayAccordion.module.css';

type AccordionProps = {
  title: string;
  children: React.ReactNode;
};

export default function DayAccordion({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div 
        className={`${styles.header} ${isOpen ? styles.open : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
      </div>
      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
}