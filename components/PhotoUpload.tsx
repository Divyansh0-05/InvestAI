"use client";

import { ChangeEvent, useRef, useState } from "react";

type PhotoUploadProps = {
  lang: string;
  onResult: (text: string) => void;
};

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Failed to read image."));
        return;
      }

      const [, base64 = ""] = result.split(",");
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

export default function PhotoUpload({ lang, onResult }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const image = await fileToBase64(file);
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          mimeType: file.type,
          lang,
        }),
      });

      const data = (await response.json()) as { result?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Photo upload failed.");
      }

      onResult(data.result || "Yeh part clear nahi tha");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Photo upload failed.";
      onResult(message);
    } finally {
      event.target.value = "";
      setIsUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-lg text-[#111827] shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Upload photo"
      >
        {isUploading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#16A34A] border-t-transparent" />
        ) : (
          "\u{1F4F7}"
        )}
      </button>
    </>
  );
}
