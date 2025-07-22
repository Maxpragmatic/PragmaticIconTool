import { useShallow } from "zustand/react/shallow";
import Select from "react-dropdown-select";
import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { IconStyle } from "@phosphor-icons/core";

import { useApplicationStore } from "@/state";

import "./StyleInput.css";

type WeightOption = { key: string; value: IconStyle; icon: JSX.Element };

const options: WeightOption[] = [
  {
    key: "Light",
    value: IconStyle.LIGHT,
    icon: <PencilSimpleLineIcon size={24} weight="light" />,
  },
];

type StyleInputProps = {};


const StyleInput = (_: StyleInputProps) => {
  const { style, setStyle } = useApplicationStore(useShallow((state) => ({
    style: state.iconWeight,
    setStyle: state.setIconWeight,
  })));

  const currentStyle = [options.find((option) => option.value === style)!];

  const handleStyleChange = (values: WeightOption[]) =>
    setStyle(values[0].value as IconStyle);

  return (
    <Select
      options={options}
      values={currentStyle}
      searchable={false}
      labelField="key"
      onChange={handleStyleChange}
      itemRenderer={({
        item,
        itemIndex,
        state: { cursor, values },
        methods,
      }) => (
        <span
          role="option"
          aria-selected={item.key === values[0].key}
          className={`react-dropdown-select-item ${itemIndex === cursor ? "react-dropdown-select-item-active" : ""
            }`}
          onClick={() => methods.addItem(item)}
        >
          {item.icon}
          {item.key}
        </span>
      )}
      contentRenderer={({ state: { values } }) => (
        <div className="react-dropdown-select-content">
          {values[0].icon}
          {values[0].key}
        </div>
      )}
    />
  );
};

export default StyleInput;
