"use client";

import React from "react";
import { inputClasses, labelClasses } from "./types";

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  showOptional?: boolean;
};

export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  hint,
  showOptional = true,
}: FieldProps) {
  return (
    <div>
      <label className={labelClasses} htmlFor={name}>
        {label}
        {!required && showOptional ? " (optional)" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses}
        placeholder={placeholder}
        required={required}
      />
      {hint ? <p className="mt-2 text-sm text-ink/45">{hint}</p> : null}
    </div>
  );
}

type AreaProps = FieldProps & { rows?: number };

export function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  hint,
  rows = 4,
  showOptional = true,
}: AreaProps) {
  return (
    <div>
      <label className={labelClasses} htmlFor={name}>
        {label}
        {!required && showOptional ? " (optional)" : ""}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClasses} resize-none`}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
      {hint ? <p className="mt-2 text-sm text-ink/45">{hint}</p> : null}
    </div>
  );
}
