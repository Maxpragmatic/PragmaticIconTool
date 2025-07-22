import React, { Fragment, Suspense, useMemo, useEffect, useState } from "react";

import "./App.css";
import Header from "@/components/Header";
import Toolbar from "@/components/Toolbar";
import IconGrid from "@/components/IconGrid";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import Notice from "@/components/Notice";
// import Recipes from "@/components/Recipes";
import { useCSSVariables } from "@/hooks";
import { ApplicationTheme, useApplicationStore } from "@/state";
import SearchInput from '@/components/SearchInput';
import '@/../public/FoundersGrotesk-Regular.otf';

const errorFallback = <Notice message="Search error" />;
const waitingFallback = <Notice type="none" message="" />;

const App: React.FC<any> = () => {
  // Add Founders Grotesk font to the body
  React.useEffect(() => {
    const font = new FontFace('Founders Grotesk', 'url(/FoundersGrotesk-Regular.otf)');
    font.load().then(() => {
      document.body.style.fontFamily = 'Founders Grotesk, Arial, sans-serif';
    });
  }, []);

  const isDark = useApplicationStore.use.applicationTheme() === ApplicationTheme.DARK;

  useCSSVariables(
    useMemo(
      () => ({
        "--foreground": isDark ? "white" : "var(--moss)",
        "--foreground-card": isDark ? "white" : "var(--moss)",
        "--foreground-secondary": isDark ? "var(--pewter)" : "var(--elephant)",
        "--background": isDark ? "var(--slate)" : "var(--vellum)",
        "--background-card": isDark ? "var(--stone)" : "var(--vellum)",
        "--background-layer": isDark ? "var(--scrim)" : "var(--translucent)",
        "--border-card": isDark ? "var(--shadow)" : "var(--moss-shadow)",
        "--border-secondary": isDark ? "var(--scrim)" : "var(--moss-shadow)",
        "--hover-tabs": isDark ? "var(--slate-sheer)" : "var(--ghost-sheer)",
        "--hover-buttons": isDark ? "var(--scrim)" : "var(--slate)",
      }),
      [isDark]
    )
  );

  const [iconCategories, setIconCategories] = React.useState({
    standard: true,
    pragmatic: true,
  });

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedSVG, setUploadedSVG] = useState<string | null>(null);
  const [iconName, setIconName] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#FFFCF2',
        borderBottom: '2px solid #F5B700',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        height: 72,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <img src="/xpbr0abyndtvc1xpwzyo.webp" alt="Pragmatic Semiconductor" style={{ height: 44, marginRight: 24 }} />
        <h1 style={{ fontSize: 28, fontWeight: 400, color: '#1A2B44', margin: 0, marginRight: 32, letterSpacing: -1, fontFamily: 'Founders Grotesk, Arial, sans-serif' }}>Pragmatic Icon Tool</h1>
      </header>
      <div style={{
        position: 'sticky',
        top: 72,
        zIndex: 99,
        background: '#FFFCF2',
        borderBottom: '1px solid #EEE',
        padding: '12px 32px',
        fontFamily: 'Founders Grotesk, Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
      }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <SearchInput />
        </div>
        <button
          style={{
            background: '#FFFF00',
            color: '#1A2B44',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            padding: '8px 20px',
            cursor: 'pointer',
            fontFamily: 'Founders Grotesk, Arial, sans-serif',
            marginLeft: 16,
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Icon
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/svg+xml"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.type !== 'image/svg+xml') {
              setUploadError('Only SVG files are allowed.');
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              setUploadedSVG(reader.result as string);
              setShowUploadDialog(true);
              setUploadError(null);
            };
            reader.readAsText(file);
          }}
        />
        {uploadError && (
          <div style={{ color: '#FF495C', fontFamily: 'Founders Grotesk, Arial, sans-serif', marginLeft: 16 }}>
            {uploadError}
          </div>
        )}
        {showUploadDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.12)', fontFamily: 'Founders Grotesk, Arial, sans-serif' }}>
              <h2 style={{ fontWeight: 400, fontSize: 22, margin: 0, marginBottom: 16 }}>Name your icon</h2>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  value={iconName}
                  onChange={e => setIconName(e.target.value)}
                  placeholder="e.g. pragmatic-chip"
                  style={{ width: '100%', fontSize: 16, padding: 8, borderRadius: 6, border: '1px solid #EEE' }}
                />
              </div>
              <div style={{ marginBottom: 16, color: '#8E8E93', fontSize: 14 }}>
                Suggestions: pragmatic-chip, pragmatic-sensor, pragmatic-wafer
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  style={{ background: '#FFFF00', color: '#1A2B44', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, padding: '8px 20px', cursor: 'pointer' }}
                  onClick={() => {
                    // TODO: Upload logic here
                    setShowUploadDialog(false);
                    setIconName('');
                    setUploadedSVG(null);
                  }}
                >
                  Upload
                </button>
                <button
                  style={{ background: 'transparent', color: '#8E8E93', border: 'none', fontWeight: 500, fontSize: 15, padding: '8px 12px', cursor: 'pointer' }}
                  onClick={() => {
                    setShowUploadDialog(false);
                    setIconName('');
                    setUploadedSVG(null);
                  }}
                >
                  Cancel
                </button>
              </div>
              <div style={{ marginTop: 16, color: '#8E8E93', fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>Note:</span> Only SVG files are allowed. Uploaded icons will be styled to match Pragmatic icons and searchable by name.
              </div>
            </div>
          </div>
        )}
      </div>
      <main>
        <IconGrid />
      </main>
    </>
  );
};

export default App;
