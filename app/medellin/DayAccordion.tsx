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
        className={styles.header} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.title}>{title}</span>
        <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}>
          ▾
        </span>
      </div>
      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
}