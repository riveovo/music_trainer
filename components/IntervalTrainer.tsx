
import React, { useState, useEffect, useCallback } from 'react';
import { IntervalQuestion, IntervalDef } from '../types';
import { generateIntervalQuestion } from '../utils/musicTheory';
import { useGuitarSynth } from '../hooks/useGuitarSynth';

// SVG Icons specific to this component
const GuitarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-8 w-8 text-neo-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const IntervalTrainer = () => {
  const [question, setQuestion] = useState<IntervalQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // abbr of interval
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use Tone.js sampler hook
  const { playInterval, playFeedback, isLoaded } = useGuitarSynth(true);

  // 初始化问题
  useEffect(() => {
    newQuestion();
  }, []);

  const newQuestion = () => {
    setQuestion(generateIntervalQuestion());
    setSelectedOption(null);
    setAnswerStatus('idle');
    setIsPlaying(false);
  };

  const handlePlay = useCallback(() => {
    if (!question || !isLoaded) return;
    setIsPlaying(true);
    // Use the explicitly randomized direction notes
    playInterval(question.firstNote, question.secondNote);
    
    // Visual feedback duration (match audio delay + note duration roughly)
    setTimeout(() => setIsPlaying(false), 2000); 
  }, [question, playInterval, isLoaded]);

  // 自动播放新问题 (仅当采样加载完成后)
  useEffect(() => {
    if (question && answerStatus === 'idle' && isLoaded) {
      // 稍微延迟一点播放，让用户有时间反应
      const timer = setTimeout(() => {
        handlePlay();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [question, answerStatus, handlePlay, isLoaded]);

  const handleOptionClick = (option: IntervalDef) => {
    if (!question || answerStatus === 'correct') return;

    setSelectedOption(option.abbr);

    if (option.abbr === question.interval.abbr) {
      setAnswerStatus('correct');
      playFeedback('success');
      // 1秒后下一题
      setTimeout(() => {
        newQuestion();
      }, 1000);
    } else {
      setAnswerStatus('wrong');
      playFeedback('error');
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      
      {/* Top Play Area */}
      <div className="w-full min-h-[250px] bg-neo-blue border-4 border-neo-black shadow-neo rounded-base flex flex-col items-center justify-center relative overflow-hidden transition-colors">
        
        {/* Animated Background Rings */}
        {isPlaying && (
          <>
            <div className="absolute w-[300px] h-[300px] rounded-full border-4 border-neo-white opacity-50 animate-ping"></div>
            <div className="absolute w-[200px] h-[200px] rounded-full border-4 border-neo-white opacity-80 animate-ping delay-75"></div>
          </>
        )}

        {/* Play Button or Loader */}
        {!isLoaded ? (
          <div className="flex flex-col items-center gap-4">
             <Spinner />
             <span className="font-bold font-mono text-sm uppercase">Downloading Guitar...</span>
          </div>
        ) : (
          <button 
            onClick={handlePlay}
            className={`z-10 bg-neo-white border-4 border-neo-black p-8 rounded-full shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-neo-active hover:scale-105 ${
              isPlaying ? 'bg-neo-pink' : ''
            }`}
          >
            <GuitarIcon />
          </button>
        )}
        
        <div className="mt-6 flex flex-col items-center gap-2">
           <div className={`font-black uppercase tracking-widest px-4 py-1 -rotate-1 transition-all ${
             isLoaded ? 'bg-neo-black text-neo-white' : 'bg-gray-300 text-gray-500'
           }`}>
             {isLoaded 
               ? (isPlaying ? 'Playing...' : 'Tap to Replay')
               : 'Tuning Strings...'
             }
           </div>
           
           <div className="text-xs font-mono font-bold opacity-60 mt-1">
              Acoustic Guitar (Standard)
           </div>
        </div>
      </div>

      {/* Answer Grid */}
      <div className="grid grid-cols-2 gap-4">
        {question?.options.map((opt) => {
          // 状态样式逻辑
          const isSelected = selectedOption === opt.abbr;
          const isCorrect = answerStatus === 'correct' && opt.abbr === question.interval.abbr;
          const isWrong = answerStatus === 'wrong' && isSelected;
          
          let btnClass = "bg-neo-white hover:bg-gray-100";
          
          if (isCorrect) {
             btnClass = "bg-neo-yellow text-neo-black animate-bounce";
          } else if (isWrong) {
             btnClass = "bg-red-500 text-white shake";
          }

          return (
            <button
              key={opt.abbr}
              onClick={() => handleOptionClick(opt)}
              disabled={answerStatus === 'correct' || !isLoaded}
              className={`
                h-24 md:h-32 border-4 border-neo-black shadow-neo rounded-base flex flex-col items-center justify-center p-2
                transition-all active:translate-x-1 active:translate-y-1 active:shadow-neo-active
                disabled:opacity-50 disabled:cursor-not-allowed
                ${btnClass}
              `}
            >
              <span className="text-xl md:text-2xl font-black">{opt.name}</span>
              <span className="font-mono text-sm md:text-base font-bold opacity-70">({opt.abbr})</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
      
      {/* Footer Info */}
      <div className="bg-neo-white border-4 border-neo-black shadow-neo rounded-base p-4 text-center">
        <p className="font-bold text-sm uppercase">Identify the interval played (Ascending or Descending).</p>
      </div>

    </div>
  );
};
