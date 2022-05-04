type option = {
  label: string;
  value: string;
}

export interface SelectProps {
  options: option[];
  handleChange: (value: string) => void;
  defaultValue?: string;
  label?: string;
}
