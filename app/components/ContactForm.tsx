"use client";

import { useState } from 'react';
import styles from './ContactForm.module.css';

type ContactFormProps = {
  formType: string;
  fields: readonly { name: string; label: string; placeholder?: string; type: 'text' | 'email' | 'textarea'; required: boolean }[];
};

export default function ContactForm({ formType, fields }: ContactFormProps) {
  const [status, setStatus] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Submitting...');

    const formData = new FormData(event.currentTarget);
    let message = '';
    formData.forEach((value, key) => {
      message += `${key}: ${value}\n`;
    });

    try {
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType, message }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus('Message sent successfully!');
        (event.target as HTMLFormElement).reset();
      } else {
        setStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      setStatus('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {fields.map(field => (
        <div key={field.name} className={styles.field}>
          <label htmlFor={field.name}>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              required={field.required}
              placeholder={field.placeholder || ''}
              className={styles.textarea}
            />
          ) : (
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              required={field.required}
              placeholder={field.placeholder || ''}
              className={styles.input}
            />
          )}
        </div>
      ))}
      <button type="submit" className={styles.button}>Send Message</button>
      {status && <p>{status}</p>}
    </form>
  );
}