import React from "react";
import "./App.css";
import SearchInput from '@/components/SearchInput';
import IconGrid from '@/components/IconGrid';

const App: React.FC<any> = () => {
  // Add Founders Grotesk font to the body
  React.useEffect(() => {
    const font = new FontFace('Founders Grotesk', 'url(/FoundersGrotesk-Regular.otf)');
    font.load().then(() => {
      document.body.style.fontFamily = 'Founders Grotesk, Arial, sans-serif';
    });
  }, []);

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
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              // Upload logic stub
            };
            reader.readAsText(file);
          }}
        />
      </div>
      <main>
        <IconGrid />
      </main>
    </>
  );
};

export default App;
