import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({immediate: true});
}

const DEFAULT_SEO_ORIGIN = 'https://ais-pre-kmn76mtea27f6hraur4mtv-779385759087.europe-west2.run.app';

if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== DEFAULT_SEO_ORIGIN) {
  const origin = window.location.origin;
  const pageUrl = `${origin}${window.location.pathname}`;
  const replaceOrigin = (value: string) => value.replaceAll(DEFAULT_SEO_ORIGIN, origin);

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = pageUrl;

  const imageSrc = document.querySelector<HTMLLinkElement>('link[rel="image_src"]');
  if (imageSrc) imageSrc.href = `${origin}/search-thumbnail.jpg`;

  document
    .querySelectorAll<HTMLMetaElement>(
      'meta[property="og:url"], meta[property="og:image"], meta[property="og:image:secure_url"], meta[name="twitter:image"], meta[name="thumbnail"]',
    )
    .forEach((meta) => {
      if (meta.content) meta.content = replaceOrigin(meta.content);
    });

  const jsonLd = document.getElementById('structured-data-seo');
  if (jsonLd?.textContent) {
    jsonLd.textContent = replaceOrigin(jsonLd.textContent);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
