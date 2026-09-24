// src/components/PasswordInput.tsx

"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function PasswordInput({
  label,
  error,
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">

      {label && (
        <label className="font-medium text-sm">
          {label}
        </label>
      )}

      <div className="relative">

        <input
          {...props}
          type={show ? "text" : "password"}
          className={`
            w-full
            rounded-xl
            border
            px-4
            py-3
            pr-12
            outline-none
            transition
            focus:border-orange-500
            ${error ? "border-red-500" : "border-slate-300"}
          `}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}