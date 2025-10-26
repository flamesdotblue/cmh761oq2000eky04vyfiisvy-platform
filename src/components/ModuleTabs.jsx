import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Image as ImageIcon, Video, Type as TypeIcon, RefreshCw, CirclePause, CirclePlay } from 'lucide-react';

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition-colors ${
      active ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
    }`}
  >
    <Icon className="w-4 h-4 text-purple-200" />
    <span>{label}</span>
  </button>
);

function analyzeTextEmotion(text) {
  const t = text.toLowerCase();
  const scores = {
    joy: 0,
    anger: 0,
    sadness: 0,
    fear: 0,
    surprise: 0,
    neutral: 0,
  };
  const dict = {
    joy: ['happy', 'joy', 'love', 'excited', 'great', 'wonderful', 'amazing', 'glad', 'delight'],
    anger: ['angry', 'mad', 'furious', 'annoyed', 'hate', 'irritated', 'rage'],
    sadness: ['sad', 'down', 'unhappy', 'depressed', 'blue', 'lonely', 'heartbroken'],
    fear: ['afraid', 'scared', 'terrified', 'nervous', 'anxious', 'worried'],
    surprise: ['surprised', 'shocked', 'wow', 'unexpected', 'astonished'],
  };
  Object.entries(dict).forEach(([emo, list]) => {
    list.forEach((w) => {
      const count = t.split(w).length - 1;
      scores[emo] += count;
    });
  });
  if (t.trim().length === 0) scores.neutral = 1;
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return { scores, label: best ? best[0] : 'neutral' };
}

const EmotionBar = ({ label, value, max }) => {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  const gradient = {
    joy: 'from-amber-300 to-pink-400',
    anger: 'from-red-400 to-rose-500',
    sadness: 'from-blue-400 to-cyan-400',
    fear: 'from-purple-400 to-indigo-500',
    surprise: 'from-fuchsia-400 to-violet-500',
    neutral: 'from-slate-300 to-slate-400',
  }[label] || 'from-purple-300 to-indigo-400';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="capitalize">{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${gradient}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const TextPanel = () => {
  const [text, setText] = useState('I am so excited and happy to try this!');
  const analysis = useMemo(() => analyzeTextEmotion(text), [text]);
  const max = Math.max(...Object.values(analysis.scores));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <label className="text-sm text-slate-300">Enter text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="mt-2 w-full rounded-lg bg-black/30 border border-white/10 p-3 outline-none focus:ring-2 ring-purple-500"
          placeholder="Type or paste content to analyze emotion..."
        />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Emotion Scores</h4>
          <span className="text-xs rounded-full border border-white/10 px-2 py-0.5 bg-white/5">Top: {analysis.label}</span>
        </div>
        <div className="space-y-3">
          {Object.entries(analysis.scores).map(([k, v]) => (
            <EmotionBar key={k} label={k} value={v} max={max} />
          ))}
        </div>
      </div>
    </div>
  );
};

const AudioPanel = () => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [level, setLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  const cleanupAudio = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] - 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length) / 128; // 0..~1
        setLevel(rms);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SR();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-US';
        recog.onresult = (e) => {
          const txt = Array.from(e.results)
            .map((r) => r[0].transcript)
            .join(' ');
          setTranscript(txt);
        };
        recog.onerror = () => {};
        recog.start();
        recognitionRef.current = recog;
      }

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      console.error(e);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    cleanupAudio();
    setRecording(false);
  };

  useEffect(() => () => stopRecording(), []);

  const analysis = useMemo(() => analyzeTextEmotion(transcript || ''), [transcript]);
  const max = Math.max(...Object.values(analysis.scores));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Microphone</h4>
            <p className="text-xs text-slate-300">Record speech to estimate energy and transcribe if supported</p>
          </div>
          <div className="flex items-center gap-2">
            {!recording ? (
              <button onClick={startRecording} className="inline-flex items-center gap-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 px-3 py-2 text-sm">
                <Mic className="w-4 h-4" /> Start
              </button>
            ) : (
              <button onClick={stopRecording} className="inline-flex items-center gap-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 px-3 py-2 text-sm">
                <CirclePause className="w-4 h-4" /> Stop
              </button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="h-24 rounded-lg border border-white/10 bg-black/30 p-3 flex items-end">
            <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-fuchsia-400 to-indigo-500 transition-[width] duration-100" style={{ width: `${Math.min(100, Math.round(level * 160))}%` }} />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-300">
            Input energy: {(level * 100).toFixed(1)}%
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm text-slate-300">Transcript</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-lg bg-black/30 border border-white/10 p-3 outline-none focus:ring-2 ring-purple-500"
            placeholder="Live transcript will appear here if supported, or type/paste to analyze."
          />
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Emotion Scores</h4>
          <span className="text-xs rounded-full border border-white/10 px-2 py-0.5 bg-white/5">Top: {analysis.label}</span>
        </div>
        <div className="space-y-3">
          {Object.entries(analysis.scores).map(([k, v]) => (
            <EmotionBar key={k} label={k} value={v} max={max} />
          ))}
        </div>
      </div>
    </div>
  );
};

function estimateImageEmotionFromPixels(ctx, w, h) {
  try {
    const data = ctx.getImageData(0, 0, w, h).data;
    let r = 0, g = 0, b = 0, c = 0;
    for (let i = 0; i < data.length; i += 4 * 8) { // sample every 8 pixels
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      c++;
    }
    if (c === 0) return { joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0, neutral: 1 };
    r /= c; g /= c; b /= c;
    const brightness = (r + g + b) / 3 / 255; // 0..1
    const warmness = (r - b + 255) / 510; // 0..1
    const coolness = (b - r + 255) / 510; // 0..1
    const scores = {
      joy: Math.max(0, brightness * 0.7 + warmness * 0.6),
      sadness: Math.max(0, coolness * 0.8 + (1 - brightness) * 0.4),
      anger: Math.max(0, warmness * 0.9 - coolness * 0.2),
      fear: Math.max(0, (1 - brightness) * 0.6 + coolness * 0.3),
      surprise: Math.max(0, Math.abs(0.5 - brightness) * 0.8),
      neutral: 0.2,
    };
    return scores;
  } catch (e) {
    return { joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0, neutral: 1 };
  }
}

const ImagePanel = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [scores, setScores] = useState({ joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0, neutral: 1 });
  const canvasRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = 320;
      const h = Math.max(1, Math.round((img.height / img.width) * w));
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const sc = estimateImageEmotionFromPixels(ctx, w, h);
      setScores(sc);
    };
    img.src = imageUrl;
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const max = Math.max(...Object.values(scores));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <label className="text-sm text-slate-300">Upload an image</label>
        <div className="mt-2 flex items-center gap-3">
          <input type="file" accept="image/*" onChange={onFileChange} className="block w-full text-sm" />
          <button onClick={() => { setImageUrl(''); setScores({ joy:0, anger:0, sadness:0, fear:0, surprise:0, neutral:1 }); }} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 overflow-hidden">
          {imageUrl ? (
            <canvas ref={canvasRef} className="w-full h-auto block" />
          ) : (
            <div className="h-48 grid place-items-center text-slate-400 text-sm">No image selected</div>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Estimated Emotion</h4>
          <span className="text-xs rounded-full border border-white/10 px-2 py-0.5 bg-white/5">
            Top: {Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0]}
          </span>
        </div>
        <div className="space-y-3">
          {Object.entries(scores).map(([k, v]) => (
            <EmotionBar key={k} label={k} value={v} max={max} />
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-300/80">This is a heuristic demo using average color and brightness; integrate real face-expression models for production.</p>
      </div>
    </div>
  );
};

const VideoPanel = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [scores, setScores] = useState({ joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0, neutral: 1 });
  const rafRef = useRef(null);

  const step = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = 320;
    const h = Math.max(1, Math.round((video.videoHeight / video.videoWidth) * w));
    const ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const sc = estimateImageEmotionFromPixels(ctx, w, h);
    setScores(sc);
    rafRef.current = requestAnimationFrame(step);
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setRunning(true);
      step();
    } catch (e) {
      console.error(e);
      setRunning(false);
    }
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setRunning(false);
  };

  useEffect(() => () => stop(), []);

  const max = Math.max(...Object.values(scores));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Webcam</h4>
            <p className="text-xs text-slate-300">Live video with heuristic emotion estimation</p>
          </div>
          {!running ? (
            <button onClick={start} className="inline-flex items-center gap-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 px-3 py-2 text-sm">
              <CirclePlay className="w-4 h-4" /> Start
            </button>
          ) : (
            <button onClick={stop} className="inline-flex items-center gap-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 px-3 py-2 text-sm">
              <CirclePause className="w-4 h-4" /> Stop
            </button>
          )}
        </div>
        <div className="mt-4 rounded-lg border border-white/10 overflow-hidden bg-black/30">
          <video ref={videoRef} playsInline muted className="w-full h-auto block" />
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Estimated Emotion</h4>
          <span className="text-xs rounded-full border border-white/10 px-2 py-0.5 bg-white/5">
            Top: {Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0]}
          </span>
        </div>
        <div className="space-y-3">
          {Object.entries(scores).map(([k, v]) => (
            <EmotionBar key={k} label={k} value={v} max={max} />
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-300/80">For true facial expression analysis, integrate a vision model (e.g., on-device WASM or server API).</p>
      </div>
    </div>
  );
};

const ModuleTabs = () => {
  const tabs = [
    { key: 'text', label: 'Text', icon: TypeIcon, panel: <TextPanel /> },
    { key: 'audio', label: 'Audio', icon: Mic, panel: <AudioPanel /> },
    { key: 'image', label: 'Image', icon: ImageIcon, panel: <ImagePanel /> },
    { key: 'video', label: 'Video', icon: Video, panel: <VideoPanel /> },
  ];
  const [active, setActive] = useState('text');

  return (
    <div id="modules" className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl sm:text-3xl font-semibold">Analyzers</h2>
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <TabButton key={t.key} active={active === t.key} icon={t.icon} label={t.label} onClick={() => setActive(t.key)} />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        {tabs.find((t) => t.key === active)?.panel}
      </div>
    </div>
  );
};

export default ModuleTabs;
