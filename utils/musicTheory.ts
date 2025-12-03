
import { BaseNote, NoteObject, IntervalDef, IntervalQuestion, MelodyQuestion, ContourDirection } from '../types';

// 基础音名数组（默认使用升号表示半音阶）
const CHROMATIC_SCALE: BaseNote[] = [
  BaseNote.C, BaseNote.CSharp, BaseNote.D, BaseNote.DSharp, BaseNote.E, BaseNote.F,
  BaseNote.FSharp, BaseNote.G, BaseNote.GSharp, BaseNote.A, BaseNote.ASharp, BaseNote.B
];

// 异名同音映射表 (Sharp -> Flat)
const ENHARMONIC_TO_FLAT: Partial<Record<BaseNote, BaseNote>> = {
  [BaseNote.CSharp]: BaseNote.DFlat,
  [BaseNote.DSharp]: BaseNote.EFlat,
  [BaseNote.FSharp]: BaseNote.GFlat,
  [BaseNote.GSharp]: BaseNote.AFlat,
  [BaseNote.ASharp]: BaseNote.BFlat,
};

// --- 音程数据 ---
export const INTERVALS: IntervalDef[] = [
  { semitones: 0, name: "纯一度", abbr: "P1", fullName: "纯一度 (P1)" },
  { semitones: 1, name: "小二度", abbr: "m2", fullName: "小二度 (m2)" },
  { semitones: 2, name: "大二度", abbr: "M2", fullName: "大二度 (M2)" },
  { semitones: 3, name: "小三度", abbr: "m3", fullName: "小三度 (m3)" },
  { semitones: 4, name: "大三度", abbr: "M3", fullName: "大三度 (M3)" },
  { semitones: 5, name: "纯四度", abbr: "P4", fullName: "纯四度 (P4)" },
  { semitones: 6, name: "增四/减五", abbr: "A4/d5", fullName: "增四/减五" },
  { semitones: 7, name: "纯五度", abbr: "P5", fullName: "纯五度 (P5)" },
  { semitones: 8, name: "小六度", abbr: "m6", fullName: "小六度 (m6)" },
  { semitones: 9, name: "大六度", abbr: "M6", fullName: "大六度 (M6)" },
  { semitones: 10, name: "小七度", abbr: "m7", fullName: "小七度 (m7)" },
  { semitones: 11, name: "大七度", abbr: "M7", fullName: "大七度 (M7)" },
  { semitones: 12, name: "纯八度", abbr: "P8", fullName: "纯八度 (P8)" },
];

/**
 * 生成指定八度范围内的所有音名
 */
export const generateScale = (startOctave: number, endOctave: number): NoteObject[] => {
  const scale: NoteObject[] = [];

  for (let oct = startOctave; oct <= endOctave; oct++) {
    CHROMATIC_SCALE.forEach(note => {
      let speakText = "";
      
      if (note === BaseNote.A) {
        speakText = "A."; 
      } else if (note === BaseNote.ASharp) {
        speakText = "A-Sharp";
      } else if (note.includes('#')) {
        speakText = `${note.replace('#', '')} Sharp`;
      } else {
        speakText = note;
      }
      
      scale.push({
        base: note,
        octave: oct,
        scientificName: `${note}${oct}`,
        displayName: `${note}${oct}`,
        speakText: speakText 
      });
    });
  }
  return scale;
};

export const getNextSequentialNote = (currentNote: NoteObject | null, scale: NoteObject[]): NoteObject => {
  if (!currentNote || scale.length === 0) return scale[0];
  const currentSharpName = normalizePitchName(currentNote.scientificName);
  const currentIndex = scale.findIndex(n => n.scientificName === currentSharpName);
  if (currentIndex === -1 || currentIndex === scale.length - 1) {
    return scale[0];
  }
  return scale[currentIndex + 1];
};

const normalizePitchName = (name: string): string => {
   const match = name.match(/^([A-G][#b]?)(-?\d+)$/);
   if (!match) return name;
   const [_, note, octave] = match;
   const flatMap: Record<string, string> = {
       'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
   };
   const sharpNote = flatMap[note] || note;
   return `${sharpNote}${octave}`;
};

export const getRandomNote = (currentNote: NoteObject | null, scale: NoteObject[]): NoteObject => {
  if (scale.length === 0) return scale[0];
  if (scale.length === 1) return scale[0];

  let nextNote: NoteObject;
  let safetyCounter = 0;
  
  do {
    const randomIndex = Math.floor(Math.random() * scale.length);
    nextNote = scale[randomIndex];
    safetyCounter++;
  } while (
    currentNote && 
    normalizePitchName(nextNote.scientificName) === normalizePitchName(currentNote.scientificName) && 
    safetyCounter < 50
  );
  
  if (ENHARMONIC_TO_FLAT[nextNote.base] && Math.random() > 0.5) {
      const flatBase = ENHARMONIC_TO_FLAT[nextNote.base]!;
      let speakText = "";
      if (flatBase === BaseNote.AFlat) {
          speakText = "A-Flat";
      } else {
          speakText = `${flatBase.replace('b', '')} Flat`;
      }
      return {
          ...nextNote,
          base: flatBase,
          scientificName: `${flatBase}${nextNote.octave}`,
          displayName: `${flatBase}${nextNote.octave}`,
          speakText: speakText
      };
  }
  return nextNote;
};

// --- 音程训练工具函数 ---

// 简单的音高转频率公式 (A4 = 440Hz)
const getMidiNote = (note: string): number => {
  const match = note.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) return 60; // default C4
  
  const [_, name, octStr] = match;
  const octave = parseInt(octStr, 10);
  
  const baseMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11
  };
  
  return (octave + 1) * 12 + baseMap[name];
};

export const getFrequency = (note: string): number => {
  const midi = getMidiNote(note);
  return 440 * Math.pow(2, (midi - 69) / 12);
};

// 将 MIDI 数字转回音名 (简化版，只用升号)
const midiToNoteName = (midi: number): string => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${notes[noteIndex]}${octave}`;
};

export const generateIntervalQuestion = (): IntervalQuestion => {
  // 1. 随机根音 
  // 吉他最低音是 E2 (MIDI 40)，最高常用大概 E5 (MIDI 76)
  // 为了保证音程不过低或过高，我们把根音范围限制在 G2 (43) 到 C5 (72)
  const rootMidi = 43 + Math.floor(Math.random() * 30); 
  
  // 2. 随机音程 (避免 P1 因为方向不明显)
  const availableIntervals = INTERVALS.filter(i => i.semitones > 0);
  const targetInterval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
  
  // 3. 计算冠音
  const targetMidi = rootMidi + targetInterval.semitones;
  
  // 4. 生成干扰项 (针对音程性质训练)
  const options = [targetInterval];
  while (options.length < 4) {
    const randomInterval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
    if (!options.some(o => o.semitones === randomInterval.semitones)) {
      options.push(randomInterval);
    }
  }
  
  // 打乱选项
  const shuffledOptions = options.sort(() => Math.random() - 0.5);

  const rootName = midiToNoteName(rootMidi);
  const targetName = midiToNoteName(targetMidi);

  // 5. 随机决定上行还是下行
  const isAscending = Math.random() > 0.5;

  return {
    rootNote: rootName,
    targetNote: targetName,
    firstNote: isAscending ? rootName : targetName,
    secondNote: isAscending ? targetName : rootName,
    direction: isAscending ? 'ascending' : 'descending',
    interval: targetInterval,
    options: shuffledOptions
  };
};

/**
 * 生成旋律轮廓问题 (5个音，4个方向)
 */
export const generateMelodyQuestion = (): MelodyQuestion => {
  const NOTE_COUNT = 5;
  const MIN_MIDI = 45; // A2
  const MAX_MIDI = 76; // E5
  
  let currentMidi = MIN_MIDI + Math.floor(Math.random() * (MAX_MIDI - MIN_MIDI));
  const notesMidi: number[] = [currentMidi];
  const directions: ContourDirection[] = [];

  for (let i = 0; i < NOTE_COUNT - 1; i++) {
    // 随机音程步进：+/- 1到12个半音
    let step = Math.floor(Math.random() * 12) + 1; // 1 to 12
    const isUp = Math.random() > 0.5;
    
    let nextMidi = isUp ? currentMidi + step : currentMidi - step;
    
    // 边界检查，如果出界则反转方向
    if (nextMidi > MAX_MIDI) {
      nextMidi = currentMidi - step;
    } else if (nextMidi < MIN_MIDI) {
      nextMidi = currentMidi + step;
    }
    
    // 计算实际方向
    if (nextMidi > currentMidi) {
      directions.push('up');
    } else {
      directions.push('down');
    }
    
    notesMidi.push(nextMidi);
    currentMidi = nextMidi;
  }

  return {
    notes: notesMidi.map(midiToNoteName),
    directions
  };
};
