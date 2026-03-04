import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  previewStart?: number;
  previewEnd?: number;
}

interface AudioPlayerState {
  track: Track | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  /** Waveform peaks (0-1), length ~80 */
  waveform: number[];
}

interface AudioPlayerActions {
  play: (track: Track) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  close: () => void;
}

type AudioPlayerContextType = AudioPlayerState & AudioPlayerActions;

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function useGlobalAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useGlobalAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
}

/** Check if a track is currently loaded (safe outside provider) */
export function useOptionalGlobalPlayer() {
  return useContext(AudioPlayerContext);
}

const WAVEFORM_BARS = 80;

function generateWaveform(audioBuffer: AudioBuffer): number[] {
  const rawData = audioBuffer.getChannelData(0);
  const samples = WAVEFORM_BARS;
  const blockSize = Math.floor(rawData.length / samples);
  const peaks: number[] = [];
  for (let i = 0; i < samples; i++) {
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[i * blockSize + j]);
    }
    peaks.push(sum / blockSize);
  }
  const max = Math.max(...peaks, 0.01);
  return peaks.map((p) => p / max);
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);

  // Lazily create <audio>
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "metadata";
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  // Fetch and decode waveform data
  const loadWaveform = useCallback(async (url: string) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const resp = await fetch(url);
      const arrayBuf = await resp.arrayBuffer();
      const audioBuf = await audioCtxRef.current.decodeAudioData(arrayBuf);
      setWaveform(generateWaveform(audioBuf));
    } catch {
      // Fallback: random waveform
      setWaveform(Array.from({ length: WAVEFORM_BARS }, () => 0.2 + Math.random() * 0.8));
    }
  }, []);

  // Wire up audio events
  useEffect(() => {
    const audio = getAudio();
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      // Respect preview window
      if (track?.previewEnd && audio.currentTime >= track.previewEnd) {
        audio.pause();
        setPlaying(false);
      }
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [getAudio, track]);

  const play = useCallback((newTrack: Track) => {
    const audio = getAudio();
    const isSame = track?.id === newTrack.id;

    if (!isSame) {
      audio.src = newTrack.audioUrl;
      audio.load();
      setTrack(newTrack);
      setCurrentTime(0);
      setDuration(0);
      setWaveform([]);
      loadWaveform(newTrack.audioUrl);

      if (newTrack.previewStart) {
        audio.currentTime = newTrack.previewStart;
      }
    }

    audio.play().catch(() => {});
  }, [getAudio, track, loadWaveform]);

  const togglePlay = useCallback(() => {
    const audio = getAudio();
    if (playing) {
      audio.pause();
    } else {
      if (track?.previewStart != null && track?.previewEnd != null) {
        if (audio.currentTime < track.previewStart || audio.currentTime >= track.previewEnd) {
          audio.currentTime = track.previewStart;
        }
      }
      audio.play().catch(() => {});
    }
  }, [getAudio, playing, track]);

  const pause = useCallback(() => {
    getAudio().pause();
  }, [getAudio]);

  const seek = useCallback((time: number) => {
    const audio = getAudio();
    audio.currentTime = time;
    setCurrentTime(time);
  }, [getAudio]);

  const close = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    audio.src = "";
    setTrack(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setWaveform([]);
  }, [getAudio]);

  return (
    <AudioPlayerContext.Provider value={{ track, playing, currentTime, duration, waveform, play, togglePlay, pause, seek, close }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
