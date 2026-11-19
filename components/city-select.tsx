import type { SelectHTMLAttributes } from "react";
import { cityOptions } from "@/lib/cities";

export function CitySelect({ placeholder = "Выбери город", ...props }: SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string }) {
  const current = String(props.value ?? props.defaultValue ?? "");
  return <select {...props}><option value="">{placeholder}</option>{cityOptions(current).map(city => <option key={city} value={city}>{city}</option>)}</select>;
}
