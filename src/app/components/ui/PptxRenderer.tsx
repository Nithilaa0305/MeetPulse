import React, { useState, useEffect, useRef } from "react";
import { Presentation, Play, Info, AlertTriangle, X, Loader2, RefreshCw } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { PptxViewer } from "@aiden0z/pptx-renderer";

const chartData = [
  { name: "Intro", attention: 95, comprehension: 88 },
  { name: "Model", attention: 85, comprehension: 80 },
  { name: "Details", attention: 70, comprehension: 65 },
  { name: "Math", attention: 60, comprehension: 50 },
  { name: "Summary", attention: 90, comprehension: 85 }
];

export function PptxRenderer({ 
  name, 
  url,
  fileObject,
  currentSlide, 
  slidesCount, 
  onSlideSelect,
  slidesText
}: { 
  name: string; 
  url?: string;
  fileObject?: File;
  currentSlide: number; 
  slidesCount: number;
  onSlideSelect?: (slide: number) => void;
  slidesText?: string[][];
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<PptxViewer | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url && !fileObject) return;
    let active = true;
    setLoading(true);
    setError(null);
    let viewerInstance: PptxViewer | null = null;

    const initViewer = async () => {
      try {
        let arrayBuffer: ArrayBuffer;
        
        if (fileObject) {
          arrayBuffer = await fileObject.arrayBuffer();
        } else if (url) {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch PPTX file from server: ${response.statusText}`);
          }
          arrayBuffer = await response.arrayBuffer();
        } else {
          throw new Error("No source provided");
        }
        
        if (!active) return;

        if (slideContainerRef.current) {
          slideContainerRef.current.innerHTML = "";
          viewerInstance = await PptxViewer.open(arrayBuffer, slideContainerRef.current, {
            renderMode: "slide",
            fitMode: "contain"
          });
          
          if (!active) {
            viewerInstance.destroy();
            return;
          }

          setViewer(viewerInstance);
          await viewerInstance.renderSlide(currentSlide);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("High-fidelity PPTX rendering initialization failed:", err);
        if (active) {
          setError(`Rendering failed: ${err.message || String(err)}`);
          setLoading(false);
        }
      }
    };

    initViewer();

    return () => {
      active = false;
      if (viewerInstance) {
        viewerInstance.destroy();
      }
      setViewer(null);
    };
  }, [url]);

  useEffect(() => {
    if (viewer && !loading && !error) {
      const targetSlide = Math.min(currentSlide, Math.max(0, viewer.slideCount - 1));
      viewer.renderSlide(targetSlide).catch(err => {
        console.error("Failed to render slide:", targetSlide, err);
      });
    }
  }, [currentSlide, viewer, loading, error]);

  const finalSlidesCount = viewer ? viewer.slideCount : (slidesText && slidesText.length > 0 ? slidesText.length : slidesCount);
  const slides = Array.from({ length: finalSlidesCount }, (_, i) => `Slide ${i + 1}`);

  return (
    <div className="w-full h-full bg-slate-950 text-white rounded-xl border border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[350px] relative">
      
      {/* Slide Thumbnails Sidebar (Left) */}
      <div className="w-full md:w-32 bg-slate-900 border-r border-white/5 p-2 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0 max-h-[100px] md:max-h-[350px]">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-1 hidden md:block">Slides</div>
        {slides.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSlideSelect?.(idx)}
            className={`flex-shrink-0 text-left p-1.5 rounded-lg border text-[10px] cursor-pointer transition-all ${
              idx === currentSlide 
                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold" 
                : "bg-slate-950 border-white/5 text-slate-400 hover:bg-white/5"
            }`}
          >
            <div className="aspect-video bg-slate-900/50 rounded flex items-center justify-center mb-1 text-[8px] font-mono border border-white/5">
              <Presentation className="w-3.5 h-3.5" />
            </div>
            <span className="truncate block max-w-[80px]">Slide {idx + 1}</span>
          </button>
        ))}
      </div>

      {/* Main Slide Presenter Stage (Center) */}
      <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-br from-indigo-950/20 to-slate-950">
        
        {/* Header bar */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-white/5 pb-2">
          <div className="flex items-center gap-1">
            <Presentation className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold truncate max-w-[150px] md:max-w-xs">{name}</span>
          </div>
          <span className="font-mono text-indigo-300 font-bold">Slide {currentSlide + 1} of {finalSlidesCount}</span>
        </div>

        {/* Presentation Container / Canvas */}
        <div className="my-4 flex-grow flex flex-col justify-center min-h-[250px] relative">
          
          {loading && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-xs text-indigo-400 font-bold z-20 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="animate-pulse">Loading presentation layout and images...</span>
            </div>
          )}

          {/* High Fidelity Render Container */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              (loading || error || (!url && !fileObject)) ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div 
              ref={slideContainerRef} 
              style={{ 
                aspectRatio: viewer ? `${viewer.slideWidth} / ${viewer.slideHeight}` : "16/9",
                height: "100%",
                maxWidth: "100%"
              }}
              className="bg-slate-950 rounded-xl overflow-hidden shadow-2xl" 
            />
          </div>

          {/* Fallback Text-based outline layout */}
          {(error || !url) && !loading && (
            <div className="my-2 space-y-4 flex-grow flex flex-col justify-center">
              {slidesText && slidesText.length > 0 ? (
                <div className="space-y-4 text-left max-w-lg mx-auto flex-grow flex flex-col justify-center w-full">
                  {slidesText[currentSlide] && slidesText[currentSlide].length > 0 ? (
                    <>
                      <h2 className="text-base md:text-lg font-extrabold text-indigo-300 border-b border-white/5 pb-2">
                        {slidesText[currentSlide][0]}
                      </h2>
                      <div className="space-y-2.5 text-xs text-slate-300 mt-2">
                        {slidesText[currentSlide].slice(1).map((line, idx) => (
                          <p key={idx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-indigo-400 mt-1 select-none">•</span>
                            <span>{line}</span>
                          </p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-xs text-slate-500 italic">
                      [Empty Slide]
                    </div>
                  )}
                </div>
              ) : currentSlide === 0 ? (
                /* Title Slide */
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-400/20 animate-pulse">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                  <h1 className="text-lg md:text-xl font-extrabold text-white leading-tight">
                    {name.replace(/\.[^/.]+$/, "")}
                  </h1>
                  <p className="text-[10px] text-indigo-300 tracking-widest uppercase font-mono">Presenting Live Outline</p>
                </div>
              ) : currentSlide === 1 ? (
                /* Outline / Index */
                <div className="space-y-3 max-w-sm mx-auto text-left">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-300 border-b border-white/5 pb-1">📚 Agenda</h2>
                  <ul className="text-xs text-slate-300 space-y-1.5 font-sans list-disc list-inside">
                    <li>Introduction & Concept Foundations</li>
                    <li>Core Mathematical Equations & Deductions</li>
                    <li>Live Data Analytics & Feedback metrics</li>
                    <li>Interactive Q&A Session</li>
                  </ul>
                </div>
              ) : currentSlide === 2 ? (
                /* Data Analytics Slide */
                <div className="space-y-2 flex-grow flex flex-col justify-center">
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">📈 Attention & Comprehension Curve</h2>
                  <div className="w-full h-32 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                        <Area type="monotone" dataKey="attention" stroke="#818cf8" fill="rgba(129, 140, 248, 0.1)" name="Attention" />
                        <Area type="monotone" dataKey="comprehension" stroke="#34d399" fill="rgba(52, 211, 153, 0.1)" name="Comprehension" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                /* Summary Slide */
                <div className="text-center space-y-2">
                  <h2 className="text-sm font-bold text-white">💡 Topic Summary & Revision</h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Review this study material online or check the downloads list to get offline access. Use the Q&A panel to submit questions.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mode Indicator Banner at bottom */}
        {viewer && !loading && !error ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center justify-between gap-2 text-[10px] text-emerald-300 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Rendering high fidelity slides. Shapes, diagrams, backgrounds, and images are fully formatted.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg flex items-center justify-between gap-2 text-[10px] text-amber-300 leading-tight">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <div className="flex flex-col">
                <span>PowerPoint presentation fallback: Renders as a text outline. Shapes and pictures are not drawn.</span>
                <span className="text-amber-500/80 font-mono text-[9px] mt-0.5">Error: {error}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowHelp(true)} 
              className="shrink-0 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/30 text-amber-200 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all"
            >
              Learn why
            </button>
          </div>
        )}
      </div>

      {/* Troubleshooting / Fixing Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Why did high-fidelity rendering fail?
              </h3>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-[11px] leading-relaxed text-slate-300">
              <p>
                Browsers require modern canvas and ZIP parsing interfaces to unpack PowerPoint slide layers. If the browser encounters layout limitations or network limits, the presentation falls back to a structural text outline mode.
              </p>
              
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-2">
                <p className="font-bold text-white">✨ Recommended Alternative:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Export your presentation as a <strong>PDF Document (.pdf)</strong>.</li>
                  <li>Upload the PDF. PDFs render page-by-page with 100% pixel-perfect accuracy and cross-platform compatibility!</li>
                </ol>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowHelp(false)}
            className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold py-2 rounded-xl text-xs mt-4 cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      )}
    </div>
  );
}

