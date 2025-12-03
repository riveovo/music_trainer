
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GenerationMode, NoteObject } from '../types';
import { generateScale, getNextSequentialNote, getRandomNote } from '../utils/musicTheory';
import { useTTS } from '../hooks/useTTS';
import { PlayIcon, PauseIcon, VolumeIcon, MuteIcon, ShuffleIcon, ListIcon } from './Icons';

// 默认配置常量
const DEFAULT_INTERVAL_MS = 2000;
const MIN_INTERVAL_MS = 500;
const MAX_INTERVAL_MS = 5000;

// 生成 C3 到 B4 的音阶
const NOTE_SCALE = generateScale(3, 4);

export const NoteTrainer = () => {
  // --- 状态管理 ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.RANDOM);
  const [intervalMs, setIntervalMs] = useState(DEFAULT_INTERVAL_MS);
  const [currentNote, setCurrentNote] = useState<NoteObject | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // 计时器引用
  const timerRef = useRef<number | null>(null);
  
  // TTS Hook
  const { speak } = useTTS(!isMuted);

  // --- 核心逻辑 ---

  const nextNote = useCallback(() => {
    setCurrentNote((prev) => {
      let next: NoteObject;
      if (mode === GenerationMode.SEQUENTIAL) {
        next = getNextSequentialNote(prev, NOTE_SCALE);
      } else {
        next = getRandomNote(prev, NOTE_SCALE);
      }
      
      // 朗读纯净的音名
      speak(next.speakText);
      return next;
    });
  }, [mode, speak]);

  // 启动/停止 自动播放逻辑
  useEffect(() => {
    if (isPlaying) {
      if (!currentNote) {
        nextNote();
      }

      timerRef.current = window.setInterval(() => {
        nextNote();
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, intervalMs, nextNote, currentNote]);


  // --- 事件处理 ---
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntervalMs(Number(e.target.value));
  };

  const displaySpeed = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
      
      {/* CARD 1: Main Display (Hero) - Spans 2 cols, 2 rows on Desktop */}
      <div className="md:col-span-2 md:row-span-2 min-h-[320px] relative bg-neo-yellow border-4 border-neo-black shadow-neo rounded-base flex flex-col items-center justify-center overflow-hidden">
        
        {/* Progress Bar (Brutalist Style) */}
        {isPlaying && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
            <div 
              className="h-full bg-black origin-left"
              style={{ 
                width: '100%', 
                animation: `progress ${intervalMs}ms linear`
              }}
              key={currentNote?.scientificName || 'init'}
            />
          </div>
        )}
        <style>{`
          @keyframes progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        `}</style>

        {/* Note Text */}
        <div className="z-10 flex flex-col items-center justify-center relative">
           <div 
            className={`text-9xl font-black tracking-tighter transition-transform duration-75 ${
              isPlaying ? 'translate-x-1 translate-y-1' : ''
            }`}
          >
            {currentNote ? currentNote.base : '?'}
          </div>
          
          {/* Decorative Elements */}
          {currentNote && (
             <div className="absolute -right-12 -top-4 rotate-12 bg-neo-white border-2 border-neo-black px-3 py-1 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               {currentNote.octave}
             </div>
          )}
          
          <div className="mt-6 px-6 py-2 bg-neo-black text-neo-white font-mono text-lg font-bold -rotate-1">
            {currentNote ? `${currentNote.scientificName}` : 'READY'}
          </div>
        </div>

        {/* Overlay for "Start" state */}
        {!isPlaying && !currentNote && (
           <div className="absolute inset-0 flex items-center justify-center z-20 bg-neo-yellow/90">
              <span className="font-black text-2xl uppercase tracking-widest animate-pulse">Press Start</span>
           </div>
        )}
      </div>

      {/* CARD 2: Play/Pause Control */}
      <button 
        onClick={togglePlay}
        className={`md:col-span-2 h-32 md:h-auto border-4 border-neo-black rounded-base shadow-neo flex flex-col items-center justify-center gap-2 transition-all active:translate-x-1 active:translate-y-1 active:shadow-neo-active ${
          isPlaying 
            ? 'bg-neo-pink text-black' 
            : 'bg-neo-blue text-black'
        }`}
      >
        <div className="scale-150 mb-2">
           {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </div>
        <span className="font-black text-2xl uppercase italic">
          {isPlaying ? 'STOP' : 'START'}
        </span>
      </button>

      {/* CARD 3: Mode Toggle */}
      <div className="md:col-span-1 h-32 md:h-auto bg-neo-white border-4 border-neo-black shadow-neo rounded-base p-4 flex flex-col justify-between">
        <span className="text-sm font-black uppercase border-b-2 border-neo-black pb-1 self-start">Mode</span>
        <div className="flex flex-col gap-2 mt-2">
           <button
              onClick={() => setMode(GenerationMode.RANDOM)}
              className={`flex-1 py-2 px-2 border-2 border-neo-black font-bold text-sm flex items-center justify-between transition-all active:translate-x-[2px] active:translate-y-[2px] ${
                mode === GenerationMode.RANDOM ? 'bg-neo-black text-neo-yellow shadow-[2px_2px_0px_0px_rgba(150,150,150,1)]' : 'bg-white hover:bg-gray-100'
              }`}
           >
              <span>RND</span>
              <ShuffleIcon />
           </button>
           <button
              onClick={() => setMode(GenerationMode.SEQUENTIAL)}
              className={`flex-1 py-2 px-2 border-2 border-neo-black font-bold text-sm flex items-center justify-between transition-all active:translate-x-[2px] active:translate-y-[2px] ${
                mode === GenerationMode.SEQUENTIAL ? 'bg-neo-black text-neo-yellow shadow-[2px_2px_0px_0px_rgba(150,150,150,1)]' : 'bg-white hover:bg-gray-100'
              }`}
           >
              <span>SEQ</span>
              <ListIcon />
           </button>
        </div>
      </div>

      {/* CARD 4: Mute Toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className={`md:col-span-1 h-32 md:h-auto border-4 border-neo-black shadow-neo rounded-base p-4 flex flex-col justify-between transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-neo-active ${
          isMuted ? 'bg-gray-300' : 'bg-neo-white'
        }`}
      >
         <span className="text-sm font-black uppercase border-b-2 border-neo-black pb-1 self-start">Audio</span>
         <div className={`self-end p-4 border-2 border-neo-black rounded-full ${isMuted ? 'bg-gray-400' : 'bg-neo-yellow'}`}>
            {isMuted ? <MuteIcon /> : <VolumeIcon />}
         </div>
      </button>

      {/* CARD 5: Speed Control */}
      <div className="md:col-span-4 bg-neo-white border-4 border-neo-black shadow-neo rounded-base p-6 flex flex-col md:flex-row items-center gap-6">
         <div className="flex items-center gap-4 min-w-[150px]">
           <div className="font-black text-xl uppercase italic">SPEED</div>
           <div className="font-mono bg-neo-black text-neo-yellow px-3 py-1 border-2 border-transparent text-lg font-bold transform -rotate-2">
             {displaySpeed(intervalMs)}
           </div>
         </div>
         
         <div className="flex-1 w-full relative flex items-center">
           <div className="w-full h-4 bg-neo-black border-2 border-neo-black rounded-full relative z-0"></div>
           <input
              type="range"
              min={MIN_INTERVAL_MS}
              max={MAX_INTERVAL_MS}
              step={100}
              value={intervalMs}
              onChange={handleSpeedChange}
              className="absolute w-full h-8 opacity-0 cursor-pointer z-20"
           />
           {/* Custom Thumb Visualization */}
           <div 
              className="absolute h-8 w-8 bg-neo-pink border-4 border-neo-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-none z-10 transition-all"
              style={{ 
                  left: `calc(${((intervalMs - MIN_INTERVAL_MS) / (MAX_INTERVAL_MS - MIN_INTERVAL_MS)) * 100}% - 16px)`
              }}
           />
         </div>

         <div className="flex justify-between w-full md:w-auto text-xs font-bold uppercase gap-8">
           <span>Fast (0.5s)</span>
           <span>Slow (5.0s)</span>
         </div>
      </div>

    </div>
  );
};
