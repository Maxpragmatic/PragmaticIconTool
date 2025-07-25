import "./ColorInput.css";

type ColorInputProps = {
  value?: string;
  onChange?: (color: string) => void;
  className?: string;
};

const DEFAULT_COLOR = "#000000";

const PRAGMATIC_COLORS = [
  { name: 'Pragmatic Yellow', hex: '#F5B700' },
  { name: 'Pragmatic Lemon', hex: '#FFF700' },
  { name: 'Black', hex: '#000000' },
  { name: 'Grey 1', hex: '#8E8E93' },
  { name: 'Grey 2', hex: '#AEAE B2' },
  { name: 'Apricot', hex: '#FFE3C6' },
  { name: 'Orange 1', hex: '#FF9F45' },
  { name: 'Orange 2', hex: '#FF7A00' },
  { name: 'Coral 1', hex: '#FF495C' },
  { name: 'Coral 2', hex: '#FFA781' },
  { name: 'Aqua 1', hex: '#17D499' },
  { name: 'Aqua 2', hex: '#99EDCC' },
  { name: 'Violet 1', hex: '#9B51E0' },
];

const ColorInput = (props: ColorInputProps) => {
  const color = props.value ?? DEFAULT_COLOR;
  const setColor = props.onChange ?? (() => {});

  return (
    <div className={`color-picker pragmatic-palette${props.className ? ' ' + props.className : ''}`}>
      {PRAGMATIC_COLORS.map((c) => (
        <button
          key={c.hex}
          className={`palette-swatch${color === c.hex ? ' selected' : ''}`}
          style={{ backgroundColor: c.hex }}
          title={c.name}
          onClick={() => setColor(c.hex)}
        />
      ))}
    </div>
  );
};

export default ColorInput;
