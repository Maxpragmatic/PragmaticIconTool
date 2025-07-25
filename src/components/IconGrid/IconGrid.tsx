import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { IconContext } from "@phosphor-icons/react";
import { ApplicationTheme, useApplicationStore } from "@/state";
import Panel from "./Panel";
import IconGridItem from "./IconGridItem";
import "./IconGrid.css";
import ColorInput from '@/components/ColorInput';
import { Svg2Png } from 'svg2png-converter';
import { saveAs } from 'file-saver';
import ReactDOMServer from 'react-dom/server';
import { IconStyle } from '@phosphor-icons/core';
import { IconEntry } from '@/lib';
import { InfoIcon, TrashIcon } from '@phosphor-icons/react';
import { supabase, PRAGMATIC_ICON_BUCKET } from '@/lib/supabase';

// Pragmatic icon type for Supabase
interface PragmaticIcon {
  id: string;
  name: string;
  svg_url: string;
}

const IconGrid = (_: {}) => {
  const {
    iconWeight: weight,
    iconSize: size,
    applicationTheme,
    filteredQueryResults,
    searchQuery: query,
    setIconColor,
  } = useApplicationStore();

  const originOffset = useRef({ top: 0, left: 0 });
  const controls = useAnimation();

  const [selected, setSelected] = useState<string[]>([]);
  const [batchColor, setBatchColor] = useState<string>('#000000');
  const [batchSize, setBatchSize] = useState<number>(64);
  const [showBatchInfo, setShowBatchInfo] = useState(false);
  const [pragmaticIcons, setPragmaticIcons] = useState<PragmaticIcon[]>([]);

  const clearSelected = () => setSelected([]);

  // Fetch pragmatic icons from Supabase
  useEffect(() => {
    const fetchPragmaticIcons = async () => {
      const { data, error } = await supabase
        .from('pragmatic_icon')
        .select('*')
        .order('uploaded_at', { ascending: false });
      if (!error && data) {
        setPragmaticIcons(data);
      }
    };
    fetchPragmaticIcons();
  }, []);

  // Helper: built-in pragmatic icons (for now, just 'gear')
  const isBuiltInPragmaticIcon = (icon: IconEntry) => icon.name === 'gear';
  const builtInPragmaticIcons = [...filteredQueryResults].filter(isBuiltInPragmaticIcon).sort((a, b) => a.name.localeCompare(b.name));
  const regularIcons = [...filteredQueryResults].filter(icon => !isBuiltInPragmaticIcon(icon)).sort((a, b) => a.name.localeCompare(b.name));

  // Merge built-in and Supabase pragmatic icons for display
  const allPragmaticIcons = [
    ...pragmaticIcons.map(icon => ({
      ...icon,
      isSupabase: true,
    })),
    ...builtInPragmaticIcons.map(icon => ({
      ...icon,
      isSupabase: false,
    })),
  ];

  // Delete pragmatic icon (Supabase only)
  const handleDeletePragmaticIcon = async (icon: PragmaticIcon) => {
    // Remove from storage
    const fileName = icon.svg_url.split('/').pop() || '';
    if (fileName) {
      await supabase.storage.from(PRAGMATIC_ICON_BUCKET).remove([fileName]);
    }
    // Remove from table
    await supabase.from('pragmatic_icon').delete().eq('id', icon.id);
    // Update UI
    setPragmaticIcons(pragmaticIcons.filter(i => i.id !== icon.id));
  };

  useEffect(() => {
    controls.start("visible");
  }, [controls, filteredQueryResults, pragmaticIcons]);

  if (!filteredQueryResults.length && !pragmaticIcons.length)
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#8E8E93' }}>
        No icons found.
      </div>
    );

  // Handler to sync batch color and global color
  const handleBatchColorChange = (color: string) => {
    setBatchColor(color);
    setIconColor(color);
  };

  return (
    <>
      <IconContext.Provider value={{ weight, size, color: batchColor, mirrored: false }}>
        <div className="grid-container">
          <i id="beacon" className="beacon" />
          <motion.div
            key={query}
            className="grid"
            initial="hidden"
            animate={controls}
          >
            {allPragmaticIcons.map((iconEntry: any, index: number) => (
              <div key={iconEntry.name + (iconEntry.id || '')} style={{ position: 'relative', overflow: 'visible' }}>
                <input
                  type="checkbox"
                  checked={selected.includes(iconEntry.name)}
                  onChange={() => setSelected(sel => sel.includes(iconEntry.name) ? sel.filter(n => n !== iconEntry.name) : [...sel, iconEntry.name])}
                  style={{ position: 'absolute', top: 4, left: 4, zIndex: 10, width: 18, height: 18, accentColor: '#FFFF00', background: '#fff', borderRadius: 4, border: '1px solid #EEE' }}
                  aria-label={`Select ${iconEntry.name}`}
                />
                <IconGridItem
                  index={index}
                  isDark={applicationTheme === ApplicationTheme.DARK}
                  entry={iconEntry}
                  originOffset={originOffset}
                />
                {iconEntry.isSupabase && (
                  <button
                    style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', cursor: 'pointer', zIndex: 11 }}
                    title="Delete icon"
                    onClick={() => handleDeletePragmaticIcon(iconEntry)}
                  >
                    <TrashIcon size={18} color="#FF495C" />
                  </button>
                )}
              </div>
            ))}
            {allPragmaticIcons.length > 0 && regularIcons.length > 0 && (
              <div style={{ width: '100%', height: 24 }} />
            )}
            {regularIcons.map((iconEntry, index) => (
              <div key={iconEntry.name} style={{ position: 'relative', overflow: 'visible' }}>
                <input
                  type="checkbox"
                  checked={selected.includes(iconEntry.name)}
                  onChange={() => setSelected(sel => sel.includes(iconEntry.name) ? sel.filter(n => n !== iconEntry.name) : [...sel, iconEntry.name])}
                  style={{ position: 'absolute', top: 4, left: 4, zIndex: 10, width: 18, height: 18, accentColor: '#FFFF00', background: '#fff', borderRadius: 4, border: '1px solid #EEE' }}
                  aria-label={`Select ${iconEntry.name}`}
                />
                <IconGridItem
                  index={index + allPragmaticIcons.length}
                  isDark={applicationTheme === ApplicationTheme.DARK}
                  entry={iconEntry}
                  originOffset={originOffset}
                />
              </div>
            ))}
          </motion.div>
          <Panel />
        </div>
      </IconContext.Provider>
      {selected.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          left: 0,
          right: 0,
          zIndex: 200,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            background: '#fff',
            border: '2px solid #FFFF00',
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            padding: '24px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            pointerEvents: 'auto',
            fontFamily: 'Founders Grotesk, Arial, sans-serif',
            minWidth: 420,
          }}>
            <span style={{ fontFamily: 'Founders Grotesk, Arial, sans-serif', fontWeight: 600, fontSize: 16 }}>
              {selected.length} selected
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#8E8E93', fontFamily: 'Founders Grotesk, Arial, sans-serif' }}>Color:</label>
              <ColorInput value={batchColor} onChange={handleBatchColorChange} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#8E8E93', fontFamily: 'Founders Grotesk, Arial, sans-serif' }}>Size (px):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button style={{ background: batchSize === 24 ? '#FFFF00' : '#EEE', color: '#1A2B44', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setBatchSize(24)}>Small</button>
                <button style={{ background: batchSize === 48 ? '#FFFF00' : '#EEE', color: '#1A2B44', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setBatchSize(48)}>Medium</button>
                <button style={{ background: batchSize === 96 ? '#FFFF00' : '#EEE', color: '#1A2B44', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setBatchSize(96)}>Large</button>
                <input
                  type="number"
                  min={16}
                  max={1024}
                  value={batchSize}
                  onChange={e => setBatchSize(parseInt(e.target.value) || 16)}
                  style={{ width: 80, borderRadius: 6, border: '1px solid #eee', padding: '4px 8px', marginLeft: 8, fontFamily: 'Founders Grotesk, Arial, sans-serif' }}
                />
                <span style={{ position: 'relative' }}>
                  <InfoIcon size={20} color="#8E8E93" style={{ cursor: 'pointer' }} onMouseEnter={() => setShowBatchInfo(true)} onMouseLeave={() => setShowBatchInfo(false)} />
                  {showBatchInfo && (
                    <div style={{ position: 'absolute', left: 24, top: -8, background: '#fff', color: '#1A2B44', border: '1px solid #EEE', borderRadius: 8, padding: '12px 16px', fontSize: 14, width: 260, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <b>When to use:</b><br/>
                      <b>SVG</b>: Best for web, always sharp, scalable, small file size.<br/>
                      <b>PNG</b>: Use for raster-only tools, fixed size, transparent background.<br/>
                      <b>WEBP</b>: Use for web/app if you want smaller files than PNG, but not always supported everywhere.
                    </div>
                  )}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
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
                }}
                onClick={() => {
                  selected.forEach(name => {
                    const icon = filteredQueryResults.find(i => i.name === name);
                    if (icon) {
                      const link = document.createElement('a');
                      link.href = `https://raw.githubusercontent.com/phosphor-icons/core/main/raw/light/${icon.name}-light.svg`;
                      link.download = `${icon.name}-light.svg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  });
                  clearSelected();
                }}
              >
                Download SVGs
              </button>
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
                }}
                onClick={async () => {
                  for (const name of selected) {
                    const icon = filteredQueryResults.find(i => i.name === name);
                    if (icon) {
                      const svgString = ReactDOMServer.renderToStaticMarkup(
                        React.createElement(icon.Icon, {
                          size: batchSize,
                          color: batchColor,
                          weight: IconStyle.LIGHT,
                        })
                      );
                      const svg = new window.DOMParser().parseFromString(svgString, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
                      await Svg2Png.save(svg, `${icon.name}-light.png`);
                    }
                  }
                  clearSelected();
                }}
              >
                Download PNGs
              </button>
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
                }}
                onClick={async () => {
                  for (const name of selected) {
                    const icon = filteredQueryResults.find(i => i.name === name);
                    if (icon) {
                      const svgString = ReactDOMServer.renderToStaticMarkup(
                        React.createElement(icon.Icon, {
                          size: batchSize,
                          color: batchColor,
                          weight: IconStyle.LIGHT,
                        })
                      );
                      const svg = new window.DOMParser().parseFromString(svgString, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
                      const dataUrl = await Svg2Png.toDataURL(svg);
                      const img = new window.Image();
                      img.src = dataUrl;
                      await new Promise(res => { img.onload = res; });
                      const canvas = document.createElement('canvas');
                      canvas.width = batchSize;
                      canvas.height = batchSize;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.drawImage(img, 0, 0, batchSize, batchSize);
                        canvas.toBlob(blob => {
                          if (blob) saveAs(blob, `${icon.name}-light.webp`);
                        }, 'image/webp');
                      }
                    }
                  }
                  clearSelected();
                }}
              >
                Download WEBPs
              </button>
            </div>
            <button
              style={{
                background: 'transparent',
                color: '#8E8E93',
                border: 'none',
                fontWeight: 500,
                fontSize: 15,
                padding: '8px 12px',
                cursor: 'pointer',
                fontFamily: 'Founders Grotesk, Arial, sans-serif',
              }}
              onClick={clearSelected}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default IconGrid;
