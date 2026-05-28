import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
function decodePCM16ToFloat32(base64Audio: string): Float32Array {
  const raw = atob(base64Audio);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768;
  }
  return float32;
}

interface VoiceGuideProps {
  text: string;
  attractionName?: string;
  location?: string;
  className?: string;
}

export function VoiceGuide({ text, attractionName, location, className }: VoiceGuideProps) {
  const { t, isRTL, language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const initAudio = useCallback(async () => {
    if (audioContextRef.current && workletRef.current) return;
    
    const ctx = new AudioContext({ sampleRate: 24000 });
    await ctx.audioWorklet.addModule("/audio-playback-worklet.js");
    const worklet = new AudioWorkletNode(ctx, "audio-playback-processor");
    worklet.connect(ctx.destination);
    
    worklet.port.onmessage = (e) => {
      if (e.data.type === "ended") {
        setIsPlaying(false);
      }
    };
    
    audioContextRef.current = ctx;
    workletRef.current = worklet;
  }, []);

  const stopAudio = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (workletRef.current) {
      workletRef.current.port.postMessage({ type: "clear" });
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const playVoiceGuide = useCallback(async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoading(true);
    
    try {
      await initAudio();
      
      abortControllerRef.current = new AbortController();
      
      const response = await fetch("/api/voice-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, attractionName, location, voice: "nova", language }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to get voice guide");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      setIsLoading(false);
      setIsPlaying(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "audio" && workletRef.current) {
              const samples = decodePCM16ToFloat32(event.data);
              workletRef.current.port.postMessage({ type: "audio", samples });
            } else if (event.type === "done") {
              workletRef.current?.port.postMessage({ type: "streamComplete" });
            } else if (event.type === "error") {
              throw new Error(event.error);
            }
          } catch (e) {
            if (!(e instanceof SyntaxError)) {
              console.error("Voice guide error:", e);
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Voice guide error:", error);
      }
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [text, isPlaying, initAudio, stopAudio]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={playVoiceGuide}
      disabled={isLoading}
      className={className}
      data-testid="button-voice-guide"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      <span className={isRTL ? "mr-2" : "ml-2"}>
        {isLoading ? t("loading") : isPlaying ? t("stopVoice") : t("voiceGuide")}
      </span>
    </Button>
  );
}
