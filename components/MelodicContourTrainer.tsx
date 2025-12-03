
import React, { useState, useEffect, useCallback } from 'react';
import { MelodyQuestion, ContourDirection } from '../types';
import { generateMelodyQuestion } from '../utils/musicTheory';
import { useGuitarSynth } from '../hooks/useGuitarSynth';

const GuitarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
);

export const MelodicContourTrainer = () => {
  const [question, setQuestion] = useState<MelodyQuestion | null>(null);
  const [userInputs, setUserInputs] = useState<ContourDirection[]>([]);
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const { playMelody, playFeedback, isLoaded } = useGuitarSynth(true);

  useEffect(() => { newQuestion(); }, []);

  const newQuestion = () => {
    setQuestion(generateMelodyQuestion());
    setUserInputs([]);
    setAnswerStatus('idle');
    setIsPlaying(false);
  };

  const handlePlay = useCallback(() => {
    if (!question || !isLoaded) return;
    setIsPlaying(true);
    playMelody(question.notes);
    // 5 notes * 0.6s approx 3s
    setTimeout(() => setIsPlaying(false), 3200);
  }, [question, playMelody, isLoaded]);

  useEffect(() => {
    if (question && answerStatus === 'idle' && isLoaded) {
      const timer = setTimeout(() => handlePlay(), 500);
      return () => clearTimeout(timer);
    }
  }, [question, answerStatus, handlePlay, isLoaded]);

  const handleInput = (direction: ContourDirection) => {
    if (answerStatus !== 'idle' || userInputs.length >= 4) return;

    const newInputs = [...userInputs, direction];
    setUserInputs(newInputs);

    // Auto check if full
    if (newInputs.length === 4 && question) {
      checkAnswer(newInputs, question.directions);
    }
  };

  const checkAnswer = (inputs: ContourDirection[], correct: ContourDirection[]) => {
    const isCorrect = inputs.every((val, idx) => val === correct[idx]);
    
    if (isCorrect) {
      setAnswerStatus('correct');
      playFeedback('success');
      setTimeout(newQuestion, 1500);
    } else {
      setAnswerStatus('wrong');
      playFeedback('error');
    }
  };

  const resetInputs = () => {
      if (answerStatus === 'correct') return;
      setUserInputs([]);
      setAnswerStatus('idle');
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      
      {/* Play Area */}
      <div className="w-full bg-neo-yellow border-4 border-neo-black shadow-neo rounded-base p-6 flex items-center justify-between">
         <div className="flex flex-col">
            <h2 className="font-black text-2xl uppercase">Melody Contour</h2>
            <p className="font-mono text-xs font-bold">5 Notes, 4 Moves</p>
         </div>
         <button 
            onClick={handlePlay}
            disabled={!isLoaded}
            className={`bg-neo-white border-4 border-neo-black p-4 rounded-full shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-neo-active hover:scale-105 ${isPlaying ? 'bg-neo-pink' : ''}`}
          >
            {isLoaded ? <GuitarIcon /> : <span className="text-xs font-bold px-2">LOAD...</span>}
        </button>
      </div>

      {/* Input Display Slots */}
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {[0, 1, 2, 3].map((index) => {
            const input = userInputs[index];
            const isFilled = input !== undefined;
            const isCorrectSlot = question && answerStatus !== 'idle' && input === question.directions[index];
            const isWrongSlot = question && answerStatus === 'wrong' && input !== question.directions[index];

            return (
                <div key={index} className={`
                    h-24 md:h-32 border-4 border-neo-black rounded-base flex items-center justify-center relative
                    ${isFilled ? 'bg-neo-white' : 'bg-gray-200 border-dashed'}
                    ${isCorrectSlot ? 'bg-neo-yellow' : ''}
                    ${isWrongSlot ? 'bg-red-200' : ''}
                `}>
                    <span className="absolute top-1 left-2 font-mono text-xs font-bold text-gray-500">#{index + 1}</span>
                    {input === 'up' && <div className="text-neo-black"><ArrowUpIcon /></div>}
                    {input === 'down' && <div className="text-neo-black"><ArrowDownIcon /></div>}
                </div>
            )
        })}
      </div>
      
      {/* Input Controls */}
      <div className="grid grid-cols-2 gap-4">
        <button 
            onClick={() => handleInput('up')}
            disabled={userInputs.length >= 4}
            className="h-20 bg-neo-blue border-4 border-neo-black shadow-neo rounded-base flex items-center justify-center gap-2 hover:brightness-110 active:translate-y-1 active:shadow-neo-active disabled:opacity-50"
        >
            <ArrowUpIcon />
            <span className="font-black text-xl">UP</span>
        </button>
        <button 
            onClick={() => handleInput('down')}
            disabled={userInputs.length >= 4}
            className="h-20 bg-neo-blue border-4 border-neo-black shadow-neo rounded-base flex items-center justify-center gap-2 hover:brightness-110 active:translate-y-1 active:shadow-neo-active disabled:opacity-50"
        >
            <ArrowDownIcon />
            <span className="font-black text-xl">DOWN</span>
        </button>
      </div>

      {/* Reset / Status */}
      <div className="flex justify-center">
         {answerStatus === 'wrong' && (
             <button onClick={resetInputs} className="font-mono font-bold underline hover:text-neo-pink">Clear & Retry</button>
         )}
         {answerStatus === 'correct' && (
             <span className="font-black text-neo-black animate-bounce">CORRECT! NEXT...</span>
         )}
      </div>

    </div>
  );
};
