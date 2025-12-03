import { useCallback, useEffect, useRef } from 'react';

export const useTTS = (enabled: boolean) => {
  const synth = useRef<SpeechSynthesis | null>(null);
  const voices = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
      
      const loadVoices = () => {
        voices.current = synth.current?.getVoices() || [];
      };
      
      loadVoices();
      if (synth.current?.onvoiceschanged !== undefined) {
        synth.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!enabled || !synth.current) return;

    if (synth.current.speaking || synth.current.pending) {
      synth.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // --- 语音选择优化策略 ---
    // 目标：找到最像真人的声音。
    // 浏览器的英文引擎通常比中文引擎质量高很多。
    // 优先级：
    // 1. Google US English (Chrome内置，非常自然)
    // 2. Microsoft Zira/Aria (Windows Edge/System，质量高)
    // 3. Samantha / Alex (macOS/iOS 高质量语音)
    // 4. 任何 en-US 语音
    
    const allVoices = voices.current;
    
    const preferredVoice = 
      // 1. Chrome / Android 高质量在线语音
      allVoices.find(v => v.name === 'Google US English') || 
      allVoices.find(v => v.name.includes('Google') && v.lang.includes('en-US')) ||
      
      // 2. Edge / Windows 高质量语音 (Natural/Online)
      allVoices.find(v => v.name.includes('Microsoft') && v.name.includes('Online') && v.lang.includes('en')) ||
      allVoices.find(v => v.name.includes('Microsoft') && v.lang.includes('en-US')) ||
      
      // 3. macOS / iOS 高质量语音
      allVoices.find(v => v.name === 'Samantha') || 
      allVoices.find(v => v.name === 'Daniel') || 
      
      // 4. 保底英文
      allVoices.find(v => v.lang === 'en-US') ||
      
      // 5. 最后的保底
      allVoices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      // 强制设置语言为语音包的语言，确保发音准确
      utterance.lang = preferredVoice.lang;
    }

    // 微调参数以增加自然感
    utterance.rate = 1.0; // 标准语速
    utterance.pitch = 1.0; 
    utterance.volume = 1.0;

    synth.current.speak(utterance);
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);

  return { speak };
};