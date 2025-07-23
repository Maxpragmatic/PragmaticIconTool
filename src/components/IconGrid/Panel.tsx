import React, { useRef, useState, useEffect, HTMLAttributes } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Svg2Png } from "svg2png-converter";
import { saveAs } from "file-saver";
import { CopyIcon, CheckCircleIcon, ArrowFatLinesDownIcon, XCircleIcon, InfoIcon } from "@phosphor-icons/react";
import ReactGA from "react-ga4";
import ReactDOMServer from 'react-dom/server';

import { useMediaQuery } from "@/hooks";
import { useApplicationStore } from "@/state";
import ColorInput from '@/components/ColorInput';
import { supabase } from '@/lib/supabase';

const variants: Record<string, Variants> = {
  desktop: {
    initial: { y: 188 },
    animate: { y: 0 },
    exit: { y: 188 },
  },
  mobile: {
    initial: { y: "60vh" },
    animate: { y: 0 },
    exit: { y: "60vh" },
  },
};

function cloneWithSize(svg: SVGSVGElement, size: number): SVGSVGElement {
  const sized = svg.cloneNode(true) as SVGSVGElement;
  sized.setAttribute("width", `${size}`);
  sized.setAttribute("height", `${size}`);
  return sized;
}

const ActionButton = (
  props: {
    active?: boolean;
    label: string;
    download?: boolean;
    disabled?: boolean;
  } & HTMLAttributes<HTMLButtonElement>
) => {
  const { active, download, label, ...rest } = props;
  const Icon = download ? ArrowFatLinesDownIcon : CopyIcon;
  return (
    <button
      {...rest}
      className={`action-button text ${props.disabled ? "disabled" : ""}`}
      aria-disabled={props.disabled}
      tabIndex={0}
      style={{
        background: '#FFFF00',
        color: '#1A2B44',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 15,
        padding: '8px 20px',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Founders Grotesk, Arial, sans-serif',
        marginRight: 8,
        opacity: props.disabled ? 0.5 : 1,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      {active ? (
        <CheckCircleIcon size={20} color="#1A2B44" weight="fill" />
      ) : (
        <Icon size={20} color="#1A2B44" weight="fill" />
      )}
      {label}
    </button>
  );
};

const Panel = () => {
  const {
    iconWeight: weight,
    iconSize: size,
    iconColor: color,
    selectionEntry: entry,
    setSelectionEntry,
    setIconSize,
  } = useApplicationStore();

  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [loadingSVG, setLoadingSVG] = useState(false);

  // Detect if this is a Supabase-uploaded icon
  const isSupabaseIcon = !!(entry && typeof entry === 'object' && 'svg_url' in entry && (entry as any).svg_url);

  // Fetch SVG for Supabase icons
  useEffect(() => {
    if (isSupabaseIcon && entry && typeof entry === 'object' && 'svg_url' in entry && (entry as any).svg_url) {
      setLoadingSVG(true);
      fetch((entry as any).svg_url)
        .then(res => res.text())
        .then(setSvgString)
        .finally(() => setLoadingSVG(false));
    } else {
      setSvgString(null);
    }
  }, [entry]);

  // Copy helpers
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1200);
  };

  // Snippet generators
  const getReactSnippet = () =>
    entry ? `import { ${entry.name.charAt(0).toUpperCase() + entry.name.slice(1)} } from "@phosphor-icons/react";\n\n<${entry.name.charAt(0).toUpperCase() + entry.name.slice(1)} size={32} color=\"#000\" />` : '';
  const getSVGSnippet = () => {
    if (isSupabaseIcon && svgString) return svgString;
    // For built-in, render SVG as string
    if (entry && entry.Icon) {
      return ReactDOMServer.renderToStaticMarkup(
        React.createElement(entry.Icon, { size: 32, color: '#000', weight })
      );
    }
    return '';
  };
  const getImgSnippet = () =>
    entry && typeof entry === 'object' && 'svg_url' in entry && (entry as any).svg_url ? `<img src="${(entry as any).svg_url}" width="32" height="32" alt="${entry.name}" />` : '';

  const isMobile = useMediaQuery("(max-width: 719px)");

  useHotkeys("esc", () => setSelectionEntry(null));

  useEffect(() => {
    if (!entry) return;
    ReactGA.event({
      category: "Grid",
      action: "Details",
      label: entry.name,
    });
  }, [entry]);

  const handleDownloadSVG = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.currentTarget.blur();
    if (!entry) return;
    if (!ref.current) return;

    const blob = new Blob([cloneWithSize(ref.current, size).outerHTML]);
    saveAs(
      blob,
      `${entry?.name}${weight === "regular" ? "" : `-${weight}`}.svg`
    );
  };

  const handleDownloadPNG = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.currentTarget.blur();
    if (!entry) return;
    if (!ref.current) return;

    Svg2Png.save(
      cloneWithSize(ref.current, size),
      `${entry?.name}${weight === "regular" ? "" : `-${weight}`}.png`
    );
  };

  const handleDownloadWEBP = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.currentTarget.blur();
    if (!entry) return;
    if (!ref.current) return;

    // Render SVG as string
    const svg = new window.DOMParser().parseFromString(svgString || ReactDOMServer.renderToStaticMarkup(
      React.createElement(entry.Icon, {
        size,
        color,
        weight,
      })
    ), 'image/svg+xml').documentElement as unknown as SVGSVGElement;
    const dataUrl = await Svg2Png.toDataURL(svg);
    const img = new window.Image();
    img.src = dataUrl;
    await new Promise(res => { img.onload = res; });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob(blob => {
        if (blob) saveAs(blob, `${entry.name}${weight === "regular" ? "" : `-${weight}`}.webp`);
      }, 'image/webp');
    }
  };

  const ref = useRef<SVGSVGElement>(null);

  return (
    <AnimatePresence initial={true}>
      {!!entry && (
        <motion.aside
          initial="initial"
          animate="animate"
          exit="exit"
          variants={isMobile ? variants.mobile : variants.desktop}
          className="secondary detail-footer card"
          transition={isMobile ? { duration: 0.25 } : { duration: 0.1 }}
          style={{
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            border: '2px solid #FFF70022',
            marginTop: 32,
            padding: '24px 32px',
            maxWidth: 600,
            left: 0,
            right: 0,
            bottom: 32,
            position: 'fixed',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 24,
          }}
        >
          <div className="detail-preview">
            <figure>
              <entry.Icon ref={ref} size={64}></entry.Icon>
              <figcaption>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <p style={{ margin: 0 }}>{entry.name}</p>
                  <span><ColorInput className="inline-palette" /></span>
                </div>
              </figcaption>
            </figure>
            {/* --- Copy Snippet Buttons --- */}
            <div style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
              {!isSupabaseIcon && (
                <>
                  <button
                    className="action-button text"
                    onClick={() => handleCopy(getReactSnippet(), 'react')}
                  >
                    {copied === 'react' ? <CheckCircleIcon size={18} color="#1A2B44" /> : <CopyIcon size={18} color="#1A2B44" />} Copy React Snippet
                  </button>
                  <button
                    className="action-button text"
                    onClick={() => handleCopy(getSVGSnippet(), 'svg')}
                  >
                    {copied === 'svg' ? <CheckCircleIcon size={18} color="#1A2B44" /> : <CopyIcon size={18} color="#1A2B44" />} Copy SVG Snippet
                  </button>
                </>
              )}
              {isSupabaseIcon && (
                <>
                  <button
                    className="action-button text"
                    disabled={loadingSVG}
                    onClick={() => svgString && handleCopy(svgString, 'svg')}
                  >
                    {copied === 'svg' ? <CheckCircleIcon size={18} color="#1A2B44" /> : <CopyIcon size={18} color="#1A2B44" />} Copy SVG Snippet
                  </button>
                  <button
                    className="action-button text"
                    onClick={() => handleCopy(getImgSnippet(), 'img')}
                  >
                    {copied === 'img' ? <CheckCircleIcon size={18} color="#1A2B44" /> : <CopyIcon size={18} color="#1A2B44" />} Copy &lt;img&gt; Snippet
                  </button>
                </>
              )}
            </div>
            {/* --- End Copy Snippet Buttons --- */}
            <div style={{ margin: '16px 0 0 0', display: 'flex', gap: 24, alignItems: 'center' }}>
              <div>
                <label htmlFor="export-size" style={{ fontSize: 13, color: '#8E8E93' }}>Size (px):</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button style={{ background: size === 24 ? '#FFFF00' : '#EEE', color: '#1A2B44', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setIconSize?.(24)}>Small</button>
                  <button style={{ background: size === 48 ? '#FFFF00' : '#EEE', color: '#1A2B44', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setIconSize?.(48)}>Medium</button>
                  <button style={{ background: size === 96 ? '#FFFF00' : '#EEE', color: '#1A2B44', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setIconSize?.(96)}>Large</button>
                  <input
                    id="export-size"
                    type="number"
                    min={16}
                    max={1024}
                    value={size}
                    onChange={e => setIconSize?.(parseInt(e.target.value) || 16)}
                    style={{ width: 80, borderRadius: 6, border: '1px solid #eee', padding: '4px 8px', marginLeft: 8 }}
                  />
                  <span style={{ position: 'relative' }}>
                    <InfoIcon size={20} color="#8E8E93" style={{ cursor: 'pointer' }} onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)} />
                    {showInfo && (
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
            </div>
            <hr />
            <div className="detail-meta" style={{ width: '100%' }}>
              <div className="detail-actions" style={{ width: '100%', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <ActionButton
                  label="SVG"
                  title="Download SVG"
                  download
                  onClick={handleDownloadSVG}
                />
                <ActionButton
                  label="PNG"
                  title="Download PNG"
                  download
                  onClick={handleDownloadPNG}
                />
                <ActionButton
                  label="WEBP"
                  title="Download WEBP"
                  download
                  onClick={handleDownloadWEBP}
                />
              </div>
            </div>
          </div>
          <button
            tabIndex={0}
            className="close-button"
            onClick={() => setSelectionEntry(null)}
            onKeyDown={(e) => {
              e.key === "Enter" && setSelectionEntry(null);
            }}
          >
            <XCircleIcon color="currentColor" size={28} weight="fill" />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Panel;
