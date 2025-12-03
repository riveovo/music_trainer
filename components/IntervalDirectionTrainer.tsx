
import React, { useState, useEffect, useCallback } from 'react';
import { IntervalQuestion } from '../types';
import { generateIntervalQuestion } from '../utils/musicTheory';
import { useGuitarSynth } from '../hooks/useGuitarSynth';

const GuitarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
);

export const IntervalDirectionTrainer = () => {
  const [question, setQuestion] = useState<IntervalQuestion | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedDirection, setSelectedDirection] = useState<'ascending' | 'descending' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playInterval, playFeedback, isLoaded } = useGuitarSynth(true);

  useEffect(() => { newQuestion(); }, []);

  const newQuestion = () => {
    setQuestion(generateIntervalQuestion());
    setAnswerStatus('idle');
    setSelectedDirection(null);
    setIsPlaying(false);
  };

  const handlePlay = useCallback(() => {
    if (!question || !isLoaded) return;
    setIsPlaying(true);
    playInterval(question.firstNote, question.secondNote);
    setTimeout(() => setIsPlaying(false), 2000);
  }, [question, playInterval, isLoaded]);

  useEffect(() => {
    if (question && answerStatus === 'idle' && isLoaded) {
      const timer = setTimeout(() => handlePlay(), 500);
      return () => clearTimeout(timer);
    }
  }, [question, answerStatus, handlePlay, isLoaded]);

  const handleAnswer = (direction: 'ascending' | 'descending') => {
    // 允许重试，只在答对后锁定
    if (!question || answerStatus === 'correct') return;

    setSelectedDirection(direction);

    if (question.direction === direction) {
      setAnswerStatus('correct');
      playFeedback('success');
      setTimeout(newQuestion, 1000);
    } else {
      setAnswerStatus('wrong');
      playFeedback('error');
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      
      {/* Play Button Area */}
      <div className="w-full min-h-[250px] bg-neo-pink border-4 border-neo-black shadow-neo rounded-base flex flex-col items-center justify-center relative overflow-hidden">
        {isPlaying && (
           <div className="absolute w-[300px] h-[300px] rounded-full border-4 border-neo-white opacity-50 animate-ping"></div>
        )}
        <button 
            onClick={handlePlay}
            disabled={!isLoaded}
            className={`z-10 bg-neo-white border-4 border-neo-black p-8 rounded-full shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-neo-active hover:scale-105 ${isPlaying ? 'bg-neo-yellow' : ''}`}
          >
            <GuitarIcon />
        </button>
        <div className="mt-4 font-black uppercase tracking-widest">{isLoaded ? (isPlaying ? 'Playing...' : 'Replay') : 'Loading...'}</div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 h-48">
         <button 
           onClick={() => handleAnswer('ascending')}
           className={`border-4 border-neo-black shadow-neo rounded-base flex flex-col items-center justify-center gap-2 transition-all active:translate-x-1 active:translate-y-1 ${
             answerStatus === 'correct' && question?.direction === 'ascending' ? 'bg-neo-yellow animate-bounce' : 
             answerStatus === 'wrong' && selectedDirection === 'ascending' ? 'bg-red-200 shake' : 
             'bg-neo-white hover:bg-gray-100'
           }`}
         >
            <ArrowUpIcon />
            <span className="font-black uppercase text-xl">Ascending</span>
            <span className="font-mono text-sm">(Up)</span>
         </button>

         <button 
           onClick={() => handleAnswer('descending')}
           className={`border-4 border-neo-black shadow-neo rounded-base flex flex-col items-center justify-center gap-2 transition-all active:translate-x-1 active:translate-y-1 ${
             answerStatus === 'correct' && question?.direction === 'descending' ? 'bg-neo-yellow animate-bounce' : 
             answerStatus === 'wrong' && selectedDirection === 'descending' ? 'bg-red-200 shake' : 
             'bg-neo-white hover:bg-gray-100'
           }`}
         >
            <ArrowDownIcon />
            <span className="font-black uppercase text-xl">Descending</span>
            <span className="font-mono text-sm">(Down)</span>
         </button>
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

       <div className="text-center font-mono font-bold text-sm bg-neo-white border-2 border-neo-black p-2 rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
         Listen to the two notes. Did the pitch go UP or DOWN?
       </div>
    </div>
  );
};
