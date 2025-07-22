import React, { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useApplicationStore } from "@/state";
import "./SizeInput.css";

const SizeInput = (_: {}) => {
  const { size, setSize } = useApplicationStore(useShallow((state) => ({
    size: state.iconSize,
    setSize: state.setIconSize,
  })));

  const handleSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value },
      } = event;
      const sizeInput = parseInt(value);
      if (sizeInput > 0) setSize(sizeInput);
    },
    [setSize]
  );

  return (
    <div className="size-bar">
      <label htmlFor="size-input">Size (px):</label>
      <input
        id="size-input"
        name="size-input"
        value={size}
        type="number"
        min={16}
        max={1024}
        onChange={handleSizeChange}
        style={{ width: 80 }}
      />
    </div>
  );
};

export default SizeInput;
