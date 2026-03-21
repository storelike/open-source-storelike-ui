import React, { useState } from "react";

type PhoneInputProps = {
  name: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  name,
  value,
  placeholder = "+7 (___) ___-__-__",
  onChange,
  className,
  required,
}) => {
  const formatPhone = (val: string) => {
    // убираем всё кроме цифр
    const digits = val.replace(/\D/g, "").slice(0, 11);

    // формат: +7 (999) 123-45-67
    const parts = [
      digits.slice(0, 1) ? "+7 " : "",
      digits.slice(1, 4) ? `(${digits.slice(1, 4)}) ` : "",
      digits.slice(4, 7),
      digits.slice(7, 9) ? `-${digits.slice(7, 9)}` : "",
      digits.slice(9, 11) ? `-${digits.slice(9, 11)}` : "",
    ];

    return parts.join("");
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhone(raw);
    e.target.value = formatted;
    onChange(e);
  };

  return (
    <input
      type="tel"
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={handleInput}
      className={className}
      required={required}
    />
  );
};

export default PhoneInput;
