"use client";

import { useState } from 'react';

type ContactFormProps = {
  formType: string;
  fields: { name: string; label: string; type: 'text' | 'email' | 'textarea'; required: boolean }[];
};

const formStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const inputStyles: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem',
};

const buttonStyles: React.CSSProperties = {
  backgroundColor: '#272626',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  alignSelf: 'flex-start',
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
    <form onSubmit={handleSubmit} style={formStyles}>
      {fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              required={field.required}
              style={{ ...inputStyles, minHeight: '150px', resize: 'vertical' }}
            />
          ) : (
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              required={field.required}
              style={inputStyles}
            />
          )}
        </div>
      ))}
      <button type="submit" style={buttonStyles}>Send Message</button>
      {status && <p>{status}</p>}
    </form>
  );
}