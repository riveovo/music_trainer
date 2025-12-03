
// 定义生成模式：随机 或 顺序
export enum GenerationMode {
  RANDOM = 'RANDOM',
  SEQUENTIAL = 'SEQUENTIAL'
}

// 视图模式
export enum ViewMode {
  NOTE_TRAINER = 'NOTE_TRAINER',
  INTERVAL_QUALITY = 'INTERVAL_QUALITY', // Renamed from INTERVAL_TRAINER for clarity
  INTERVAL_DIRECTION = 'INTERVAL_DIRECTION',
  MELODIC_CONTOUR = 'MELODIC_CONTOUR'
}

// 基础音名枚举 (包含升号和降号)
export enum BaseNote {
  C = 'C',
  CSharp = 'C#',
  DFlat = 'Db',
  D = 'D',
  DSharp = 'D#',
  EFlat = 'Eb',
  E = 'E',
  F = 'F',
  FSharp = 'F#',
  GFlat = 'Gb',
  G = 'G',
  GSharp = 'G#',
  AFlat = 'Ab',
  A = 'A',
  ASharp = 'A#',
  BFlat = 'Bb',
  B = 'B'
}

// 完整的音名对象结构
export interface NoteObject {
  base: BaseNote;
  octave: number;
  scientificName: string; // e.g. "C4"
  displayName: string; // 用于UI显示
  speakText: string; // 用于TTS朗读，例如 "C Sharp 4"
}

// 音程定义
export interface IntervalDef {
  semitones: number;
  name: string;      // 中文名称 e.g. "纯五度"
  abbr: string;      // 简写 e.g. "P5"
  fullName: string;  // 组合显示 e.g. "纯五度 (P5)"
}

export interface IntervalQuestion {
  rootNote: string;      // 理论上的根音 e.g. "C4"
  targetNote: string;    // 理论上的冠音 e.g. "G4"
  firstNote: string;     // 实际播放的第一个音 (可能是根音也可能是冠音)
  secondNote: string;    // 实际播放的第二个音
  direction: 'ascending' | 'descending'; // 方向
  interval: IntervalDef;
  options: IntervalDef[]; // 4 options including correct one
}

export type ContourDirection = 'up' | 'down';

export interface MelodyQuestion {
  notes: string[]; // 5 notes e.g. ["C3", "G3", "E3", "F3", "C4"]
  directions: ContourDirection[]; // 4 directions e.g. ["up", "down", "up", "up"]
}

export interface AppState {
  isPlaying: boolean;
  mode: GenerationMode;
  intervalMs: number; // 切换间隔（毫秒）
  currentNote: NoteObject | null;
  isMuted: boolean;
}
