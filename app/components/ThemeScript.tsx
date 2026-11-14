'use client';
import { useRef } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;
export default function ThemeScript() {
  const insertedRef = useRef(false);
  useServerInsertedHTML(() => {
    if (insertedRef.current) return null;
    insertedRef.current = true;
    return (
      <script
        id="theme-init"
        dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
      />
    );
  });
  return null;
}