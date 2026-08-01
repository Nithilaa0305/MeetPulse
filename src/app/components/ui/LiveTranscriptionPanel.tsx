import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Search, Key, Sparkles, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { useMeetingStore } from "../../../store/useMeetingStore";
import { TranscriptSegment } from "../../types";

const KEYWORDS = [
  "backpropagation", "neural networks", "activation", "sigmoid", "relu", 
  "gradient descent", "calculus", "chain rule", "loss", "deep learning", 
  "forward propagation", "weights", "derivatives"
];

// Predefined lecture transcripts for simulator/fallback matching each slide
const SIMULATED_TRANSCRIPTS: Record<number, string[]> = {
  0: [
    "Welcome everyone to CS401 Deep Learning. Today we are kicking off our deep dive into Neural Networks.",
    "First, we will review the basic concept of artificial neurons and how they process features.",
    "Let's look at how layered architectures represent hierarchy in learning complex patterns."
  ],
  1: [
    "Moving onto the mathematical neuron model. Here we calculate the weighted sum of inputs.",
    "We multiply each input by its corresponding weight, sum them up, and add a bias term.",
    "This linear combination is the foundation before we introduce non-linearity."
  ],
  2: [
    "Now, why do we need activation functions? Because linear layers alone can only learn linear boundaries.",
    "The Sigmoid function squashes outputs between zero and one, but it suffers from vanishing gradients.",
    "To solve this, we use Rectified Linear Unit, or ReLU, which is simply the maximum of zero and the input."
  ],
  3: [
    "Let's address forward propagation calculus. We trace the signal from input layers to the final output.",
    "We compute the output at each hidden unit sequentially, storing intermediate values.",
    "This sets up our prediction score which we'll compare against target labels."
  ],
  4: [
    "Once we have predictions, we must define neural errors and loss optimization.",
    "We use loss functions like Mean Squared Error or Cross-Entropy to measure how wrong our predictions are.",
    "The goal of training is to minimize this loss value using mathematical optimization."
  ],
  5: [
    "Now, the core topic: Backpropagation Principles and the Chain Rule.",
    "We compute the partial derivatives of the loss function with respect to every weight in the network.",
    "By applying the calculus chain rule, we propagate errors backward from output to input layers."
  ],
  6: [
    "Finally, we use those computed gradients in Gradient Descent Optimization.",
    "We update the weights by subtracting a small step in the direction of steepest descent.",
    "This step size is controlled by the learning rate parameter, which is crucial for convergence."
  ]
};

export function LiveTranscriptionPanel({ isReadOnly = false }: { isReadOnly?: boolean }) {
  const { 
    currentSlide, 
    transcript, 
    transcriptionStatus, 
    setTranscriptionStatus, 
    addTranscriptSegment, 
    clearTranscripts 
  } = useMeetingStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Audio Recording states
  const recognitionRef = useRef<any>(null);
  const simulationIntervalRef = useRef<any>(null);
  const simulationIndexRef = useRef<number>(0);

  // Auto-scroll when new transcripts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Keep track of slide changes in simulation mode
  useEffect(() => {
    if (isSimulating && transcriptionStatus === "listening") {
      // Trigger a direct transcript segment when slide changes
      const list = SIMULATED_TRANSCRIPTS[currentSlide] || SIMULATED_TRANSCRIPTS[6] || [];
      const phrase = list[0];
      
      setTranscriptionStatus("transcribing");
      setTimeout(() => {
        addTranscriptSegment({
          speaker: "Dr. Sarah Chen",
          text: phrase,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          confidence: 0.96 + Math.random() * 0.04,
          slide: currentSlide
        });
        setTranscriptionStatus("listening");
      }, 1000);
    }
  }, [currentSlide, isSimulating]);



  // Start Browser Web Speech Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Browser Web Speech API not supported. Using simulation mode.");
      startSimulation();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setTranscriptionStatus("listening");
    };

    recognition.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const transcriptText = event.results[resultIndex][0].transcript;
      const confidence = event.results[resultIndex][0].confidence || 0.95;

      setTranscriptionStatus("transcribing");
      setTimeout(() => {
        addTranscriptSegment({
          speaker: "Presenter (Web Speech)",
          text: transcriptText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          confidence: confidence,
          slide: currentSlide
        });
        setTranscriptionStatus("listening");
      }, 500);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === "not-allowed") {
        setErrorMsg("Microphone access denied. Using simulation mode.");
        startSimulation();
      }
    };

    recognition.onend = () => {
      if (transcriptionStatus === "listening") {
        // Automatically restart if still active
        recognition.start();
      }
    };

    recognition.start();
  };

  // Stop Browser Speech Recognition
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  // Start Simulation
  const startSimulation = () => {
    setIsSimulating(true);
    setTranscriptionStatus("listening");
    simulationIndexRef.current = 0;

    const runSimulationStep = () => {
      const slidePhrases = SIMULATED_TRANSCRIPTS[currentSlide] || SIMULATED_TRANSCRIPTS[6] || [];
      const text = slidePhrases[simulationIndexRef.current % slidePhrases.length];
      simulationIndexRef.current++;

      setTranscriptionStatus("transcribing");
      
      setTimeout(() => {
        addTranscriptSegment({
          speaker: "Dr. Sarah Chen",
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          confidence: 0.97 + Math.random() * 0.03,
          slide: currentSlide
        });
        setTranscriptionStatus("listening");
      }, 1200);
    };

    // Run first step instantly
    runSimulationStep();

    // Trigger every 14 seconds
    simulationIntervalRef.current = setInterval(runSimulationStep, 14000);
  };

  // Stop Simulation
  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  };

  // Start Transcribing Toggle
  const startTranscribing = () => {
    setErrorMsg("");
    startSpeechRecognition();
  };

  // Stop Transcribing Toggle
  const stopTranscribing = () => {
    stopSpeechRecognition();
    stopSimulation();
    setTranscriptionStatus("completed");
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      stopSimulation();
    };
  }, []);

  // Helper to highlight keywords in text
  const renderHighlightedText = (text: string) => {
    const parts = text.split(new RegExp(`\\b(${KEYWORDS.join("|")})\\b`, "gi"));
    return (
      <span>
        {parts.map((part, i) => {
          const isKeyword = KEYWORDS.includes(part.toLowerCase());
          return isKeyword ? (
            <span key={i} className="text-cyan-300 font-bold bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-400/20">
              {part}
            </span>
          ) : (
            part
          );
        })}
      </span>
    );
  };

  // Filtered transcript list
  const filteredTranscript = transcript.filter(t => 
    t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex flex-col h-full space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            transcriptionStatus === "listening" ? "bg-emerald-500 animate-pulse" :
            transcriptionStatus === "transcribing" ? "bg-cyan-500 animate-spin" :
            transcriptionStatus === "completed" ? "bg-indigo-500" : "bg-slate-500"
          }`} />
          <h3 className="font-bold text-sm text-white">Live Transcription</h3>
        </div>
        
        {/* Status Badge */}
        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded border border-white/10 text-slate-300">
          {transcriptionStatus === "idle" && "Idle"}
          {transcriptionStatus === "listening" && "Listening..."}
          {transcriptionStatus === "transcribing" && "Processing..."}
          {transcriptionStatus === "completed" && "Completed"}
        </span>
      </div>



      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl text-[10px] flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Control Buttons (Presenter Only) */}
      {!isReadOnly && (
        <div className="flex gap-2">
          {transcriptionStatus === "listening" || transcriptionStatus === "transcribing" ? (
            <button 
              onClick={stopTranscribing}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-2.5 text-xs font-bold flex-1 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/20 transition-all"
            >
              <MicOff className="w-4 h-4" /> Stop Transcription
            </button>
          ) : (
            <button 
              onClick={startTranscribing}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white rounded-xl py-2.5 text-xs font-bold flex-1 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/25 transition-all"
            >
              <Mic className="w-4 h-4 animate-bounce" /> Start Live Transcribing
            </button>
          )}

          <button 
            onClick={clearTranscripts}
            className="border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl px-3 py-2.5 text-xs cursor-pointer"
            title="Reset Transcript Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input 
          placeholder="Search transcript log..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs outline-none text-white focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Transcript Log list */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px] min-h-[160px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {filteredTranscript.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs italic">
            {searchQuery ? "No transcripts match query." : "No speech transcribed yet. Start mic input above."}
          </div>
        ) : (
          filteredTranscript.map((seg) => (
            <div 
              key={seg.id} 
              className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all text-[11px] space-y-1.5 relative group"
            >
              <div className="flex justify-between items-center text-[9px] text-slate-400">
                <span className="font-bold text-indigo-400">{seg.speaker}</span>
                <div className="flex items-center gap-2">
                  <span>{seg.timestamp}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded">
                    {Math.round(seg.confidence * 100)}% Conf
                  </span>
                </div>
              </div>
              
              <p className="text-slate-200 leading-relaxed font-medium">
                {renderHighlightedText(seg.text)}
              </p>

              {/* Jump to Slide button */}
              <div className="flex justify-between items-center pt-1 border-t border-white/5 mt-1">
                <span className="text-[8px] text-slate-500 font-mono">
                  Slide {seg.slide + 1}
                </span>
                <span className="text-[8px] text-slate-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Layers className="w-2.5 h-2.5 text-primary" /> Slide Context Linked
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
