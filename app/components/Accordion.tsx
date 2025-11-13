"use client";

import { useState } from 'react';
import styles from './Accordion.module.css';

type AccordionProps = {
  title: string;
  children: React.ReactNode;
};

export default function Accordion({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        {title}
        <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}>
          ▾
        </span>
      </div>
      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
}