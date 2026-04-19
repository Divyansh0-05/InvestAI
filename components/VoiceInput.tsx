"use client";

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";

type SpeechRecognitionResultAlternative = {
  transcript: string;
};

type SpeechRecognitionResult = {
  0: SpeechRecognitionResultAlternative;
  isFinal: boolean;
  length: number;
};

type SpeechRecognitionEvent = {
  results: {
    0: SpeechRecognitionResult;
    length: number;
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type VoiceInputProps = {
  onTranscript: (text: string) => void;
};

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    setIsSupported(Boolean(SpeechRecognition));
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  function handleStartRecording() {
    if (typeof window === "undefined" || isRecording) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  }

  if (typeof window === "undefined" || !isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleStartRecording}
      disabled={isRecording}
      className={[
        "flex h-10 w-10 items-center justify-center rounded-full border border-[#E2F0E8] bg-white text-gray-700 shadow-sm transition hover:bg-gray-50",
        isRecording ? "border-red-400 bg-red-500 text-white hover:bg-red-500" : "",
      ].join(" ")}
      aria-label={isRecording ? "Listening" : "Start voice input"}
    >
      <Mic className="h-5 w-5" />
    </button>
  );
}
