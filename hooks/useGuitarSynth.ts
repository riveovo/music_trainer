
import { useRef, useCallback, useEffect, useState } from 'react';
import * as Tone from 'tone';

// 真实采样方案 (基于 Tone.js Sampler)
// 回退到 nbrosowsky/tonejs-instruments 源
// 特点：加载稳定，音色自然 (Standard Acoustic Guitar)
export const useGuitarSynth = (enabled: boolean = true) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const feedbackSynthRef = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 1. 初始化吉他采样器
    // 使用 nbrosowsky 整理的 tonejs-instruments 库
    // 这是一个非常标准的采样库，稳定性高
    const sampler = new Tone.Sampler({
      urls: {
        'E2': 'E2.wav',
        'A2': 'A2.wav',
        'C3': 'C3.wav',
        'D3': 'D3.wav',
        'E3': 'E3.wav',
        'G3': 'G3.wav',
        'A3': 'A3.wav',
        'C4': 'C4.wav',
        'E4': 'E4.wav',
        'G4': 'G4.wav',
        'C5': 'C5.wav' // 确保高音也有采样
      },
      release: 1,
      // 注意：末尾必须带 /
      baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-acoustic/",
      onload: () => {
        console.log("Acoustic Guitar Samples Loaded!");
        setIsLoaded(true);
      }
    }).toDestination();

    sampler.volume.value = -3;

    samplerRef.current = sampler;

    // 2. 初始化反馈音效 (简单的合成器)
    const feedbackSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.5 }
    }).toDestination();
    feedbackSynth.volume.value = -6;
    feedbackSynthRef.current = feedbackSynth;

    return () => {
      sampler.dispose();
      feedbackSynth.dispose();
    };
  }, [enabled]);

  // 播放音程 (两个音)
  const playInterval = useCallback(async (note1: string, note2: string) => {
    if (!samplerRef.current || !isLoaded) return;

    // 确保 AudioContext 已启动
    await Tone.start();

    const now = Tone.now();
    
    // 模拟拨弦：加入微小的随机时间偏移
    const humanize = Math.random() * 0.05;

    // 1. Root Note
    samplerRef.current.triggerAttackRelease(note1, "2n", now + humanize);
    
    // 2. Target Note
    samplerRef.current.triggerAttackRelease(note2, "2n", now + 0.6 + humanize);
    
  }, [isLoaded]);

  // 播放旋律 (多个音)
  const playMelody = useCallback(async (notes: string[]) => {
    if (!samplerRef.current || !isLoaded) return;
    await Tone.start();
    const now = Tone.now();
    
    notes.forEach((note, index) => {
       const humanize = Math.random() * 0.03;
       const time = now + index * 0.6 + humanize; // 每个音间隔0.6s
       samplerRef.current?.triggerAttackRelease(note, "4n", time);
    });
  }, [isLoaded]);

  // 播放反馈 (成功/失败)
  const playFeedback = useCallback(async (type: 'success' | 'error') => {
    if (!feedbackSynthRef.current) return;
    await Tone.start();

    const now = Tone.now();
    
    if (type === 'success') {
      // 欢快的大三度上行
      feedbackSynthRef.current.triggerAttackRelease(["C5", "E5"], "8n", now);
      feedbackSynthRef.current.triggerAttackRelease("G5", "8n", now + 0.1);
    } else {
      // 沉闷的小二度
      feedbackSynthRef.current.triggerAttackRelease(["C3", "C#3"], "4n", now);
    }
  }, []);

  return { playInterval, playMelody, playFeedback, isLoaded };
};
