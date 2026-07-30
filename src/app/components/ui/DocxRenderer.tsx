import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

export function DocxRenderer({ url, name }: { url: string; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const renderDocx = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        if (!active) return;
        
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          await renderAsync(arrayBuffer, containerRef.current, undefined, {
            inWrapper: false,
            ignoreWidth: true,
            ignoreHeight: true,
            debug: false
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error rendering docx:", err);
        if (active) {
          setError("Direct browser rendering failed. You can still download the file using the link below.");
          setLoading(false);
        }
      }
    };

    renderDocx();

    return () => {
      active = false;
    };
  }, [url]);

  return (
    <div className="w-full h-full bg-white text-black p-4 rounded-xl overflow-auto min-h-[300px] max-h-[450px] relative text-left">
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs text-indigo-600 font-bold z-20">
          <span className="animate-pulse">Loading Word Document Elements...</span>
        </div>
      )}
      {error && (
        <div className="p-6 text-center space-y-3 z-20 relative bg-white h-full flex flex-col justify-center items-center">
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
          <a href={url} download={name} className="inline-block bg-indigo-600 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-indigo-700">
            Download Handout ({name})
          </a>
        </div>
      )}
      <div ref={containerRef} className="docx-content-view text-xs leading-relaxed" style={{ fontFamily: "Calibri, Arial, sans-serif" }} />
    </div>
  );
}
