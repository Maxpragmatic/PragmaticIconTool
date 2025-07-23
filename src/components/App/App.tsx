import React from "react";
import "./App.css";
import SearchInput from '@/components/SearchInput';
import IconGrid from '@/components/IconGrid';

const IMGUR_CLIENT_ID = '546f2b6b6b6b6b6'; // Demo client ID, replace with your own for production

const App: React.FC<any> = () => {
  React.useEffect(() => {
    const font = new FontFace('Founders Grotesk', 'url(/FoundersGrotesk-Regular.otf)');
    font.load().then(() => {
      document.body.style.fontFamily = 'Founders Grotesk, Arial, sans-serif';
    });
  }, []);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadedIcons, setUploadedIcons] = React.useState<{ name: string, url: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('uploadedIcons') || '[]');
    } catch {
      return [];
    }
  });

  // Helper to normalize SVG string
  const normalizeSVG = (svgString: string) => {
    try {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svg = doc.documentElement;
      svg.setAttribute('width', '256');
      svg.setAttribute('height', '256');
      svg.setAttribute('viewBox', '0 0 256 256');
      const walk = (el: Element) => {
        el.removeAttribute('fill');
        el.removeAttribute('stroke');
        el.setAttribute('fill', 'currentColor');
        Array.from(el.children).forEach(walk);
      };
      walk(svg);
      return svg.outerHTML;
    } catch (e) {
      return svgString;
    }
  };

  const handleUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const normalizedSVG = normalizeSVG(reader.result as string);
        // Imgur requires base64 data
        const base64SVG = btoa(unescape(encodeURIComponent(normalizedSVG)));
        const name = file.name.replace(/\.svg$/i, '').toLowerCase();
        const res = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            Accept: 'application/json',
          },
          body: new URLSearchParams({
            image: base64SVG,
            type: 'base64',
            name: file.name,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.data?.error || 'Imgur upload failed');
        const url = data.data.link;
        alert('Icon uploaded!');
        const newIcons = [{ name, url }, ...uploadedIcons];
        setUploadedIcons(newIcons);
        localStorage.setItem('uploadedIcons', JSON.stringify(newIcons));
      } catch (err: any) {
        alert('Upload failed: ' + (err.message || err));
      }
    };
    reader.readAsText(file);
  };

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
          onChange={async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.type !== 'image/svg+xml') {
              alert('Only SVG files are allowed.');
              return;
            }
            await handleUpload(file);
          }}
        />
      </div>
      {/* Show uploaded icons for this user */}
      {uploadedIcons.length > 0 && (
        <div style={{ padding: 24, background: '#FFFDEB', borderBottom: '1px solid #EEE' }}>
          <h3 style={{ fontFamily: 'Founders Grotesk, Arial, sans-serif', fontWeight: 400, fontSize: 18 }}>Your Uploaded Icons (this browser only)</h3>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {uploadedIcons.map(icon => (
              <div key={icon.url} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <img src={icon.url} alt={icon.name} style={{ width: 64, height: 64, background: '#fff', borderRadius: 8, border: '1px solid #EEE' }} />
                <span style={{ fontSize: 13 }}>{icon.name}</span>
                <input type="text" value={icon.url} readOnly style={{ width: 180, fontSize: 12, border: '1px solid #EEE', borderRadius: 4, padding: 2 }} onFocus={e => e.target.select()} />
              </div>
            ))}
          </div>
        </div>
      )}
      <main>
        <IconGrid />
      </main>
    </>
  );
};

export default App;
