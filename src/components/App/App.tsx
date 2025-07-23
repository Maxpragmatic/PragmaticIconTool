import React from "react";
import "./App.css";
import SearchInput from '@/components/SearchInput';
import IconGrid from '@/components/IconGrid';
import { supabase, PRAGMATIC_ICON_BUCKET } from '@/lib/supabase';

const App: React.FC<any> = () => {
  // Add Founders Grotesk font to the body
  React.useEffect(() => {
    const font = new FontFace('Founders Grotesk', 'url(/FoundersGrotesk-Regular.otf)');
    font.load().then(() => {
      document.body.style.fontFamily = 'Founders Grotesk, Arial, sans-serif';
    });
  }, []);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Helper to normalize SVG string
  const normalizeSVG = (svgString: string) => {
    try {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svg = doc.documentElement;
      svg.setAttribute('width', '256');
      svg.setAttribute('height', '256');
      svg.setAttribute('viewBox', '0 0 256 256');
      // Remove fill/stroke attributes from all children
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

  // Refresh pragmatic icons in IconGrid after upload
  const refreshPragmaticIcons = () => {
    // Dispatch a custom event to notify IconGrid to refresh
    window.dispatchEvent(new CustomEvent('refreshPragmaticIcons'));
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
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                // Normalize SVG
                const normalizedSVG = normalizeSVG(reader.result as string);
                // Get icon name from file (without extension)
                const name = file.name.replace(/\.svg$/i, '').toLowerCase();
                // Upload SVG to Supabase Storage
                const filePath = `${name}-${Date.now()}.svg`;
                const { error: uploadError } = await supabase.storage.from(PRAGMATIC_ICON_BUCKET).upload(filePath, normalizedSVG, { contentType: 'image/svg+xml', upsert: true });
                if (uploadError) throw uploadError;
                // Get public URL
                const { data: publicUrlData } = supabase.storage.from(PRAGMATIC_ICON_BUCKET).getPublicUrl(filePath);
                const svg_url = publicUrlData.publicUrl;
                // Insert row in pragmatic_icons table
                const { error: insertError } = await supabase.from('pragmatic_icon').insert([{ name, svg_url }]);
                if (insertError) throw insertError;
                alert('Icon uploaded!');
                refreshPragmaticIcons();
              } catch (err: any) {
                alert('Upload failed: ' + (err.message || err));
              }
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
