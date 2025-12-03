
import React, { useState } from 'react';
import { ViewMode } from './types';
import { NoteTrainer } from './components/NoteTrainer';
import { IntervalTrainer } from './components/IntervalTrainer';
import { IntervalDirectionTrainer } from './components/IntervalDirectionTrainer';
import { MelodicContourTrainer } from './components/MelodicContourTrainer';

export default function App() {
  const [view, setView] = useState<ViewMode>(ViewMode.NOTE_TRAINER);

  const navBtnClass = (active: boolean) => `
    flex-1 py-3 px-1 border-4 border-neo-black font-black uppercase tracking-tighter text-xs md:text-sm lg:text-base transition-all whitespace-nowrap
    ${active 
      ? 'bg-neo-black text-neo-yellow shadow-neo translate-x-[-2px] translate-y-[-2px]' 
      : 'bg-white text-gray-500 hover:bg-gray-100 shadow-neo'
    }
  `;

  return (
    <div className="flex-1 flex flex-col items-center p-4 md:p-8">
      
      {/* Header & Nav */}
      <div className="w-full max-w-3xl mb-8 flex flex-col gap-4">
        
        {/* Title Block */}
        <div className="flex justify-between items-center bg-neo-white border-4 border-neo-black p-4 shadow-neo rounded-base">
           <div className="flex items-baseline gap-3">
             <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">Music Trainer</h1>
             <span className="hidden md:inline bg-neo-pink px-2 py-0.5 text-xs font-bold border-2 border-neo-black -rotate-2">NEO</span>
           </div>
           <div className="font-mono text-xs font-bold">v2.0</div>
        </div>

        {/* View Switcher Tabs (Grid for better mobile layout) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setView(ViewMode.NOTE_TRAINER)}
            className={navBtnClass(view === ViewMode.NOTE_TRAINER)}
          >
            Notes
          </button>
          <button
            onClick={() => setView(ViewMode.INTERVAL_QUALITY)}
            className={navBtnClass(view === ViewMode.INTERVAL_QUALITY)}
          >
            Intervals
          </button>
          <button
            onClick={() => setView(ViewMode.INTERVAL_DIRECTION)}
            className={navBtnClass(view === ViewMode.INTERVAL_DIRECTION)}
          >
            Direction
          </button>
          <button
            onClick={() => setView(ViewMode.MELODIC_CONTOUR)}
            className={navBtnClass(view === ViewMode.MELODIC_CONTOUR)}
          >
            Melody
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {view === ViewMode.NOTE_TRAINER && <NoteTrainer />}
      {view === ViewMode.INTERVAL_QUALITY && <IntervalTrainer />}
      {view === ViewMode.INTERVAL_DIRECTION && <IntervalDirectionTrainer />}
      {view === ViewMode.MELODIC_CONTOUR && <MelodicContourTrainer />}

      <footer className="mt-12 font-mono text-xs font-bold border-t-4 border-neo-black pt-4 w-full max-w-3xl text-center uppercase tracking-widest">
        © 2025 Note Trainer // NEO-BRUTALISM EDITION
      </footer>
    </div>
  );
}
