import React, { useState } from 'react';
import { Copy, Check, Download, Loader2 } from 'lucide-react';
import { toBlob, toPng } from 'html-to-image';

interface CopyChartButtonProps {
  /** Reference to the DOM element containing the chart to capture */
  chartRef: React.RefObject<HTMLDivElement>;
  /** Optional custom title for exported file */
  title?: string;
  className?: string;
}

export const CopyChartButton: React.FC<CopyChartButtonProps> = ({
  chartRef,
  title = 'grafico',
  className = ''
}) => {
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'downloaded' | 'error'>('idle');

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!chartRef.current) return;
    try {
      setStatus('copying');
      
      const node = chartRef.current;
      
      // Render PNG blob
      const blob = await toBlob(node, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        style: {
          borderRadius: '16px',
        }
      });

      if (!blob) {
        throw new Error('Falha ao gerar a imagem do gráfico.');
      }

      let copiedToClipboard = false;

      // Try copying to clipboard if supported
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          copiedToClipboard = true;
        } catch (clipErr) {
          console.warn('Clipboard write failed, fallback to download:', clipErr);
        }
      }

      if (copiedToClipboard) {
        setStatus('copied');
      } else {
        // Fallback: download PNG file
        const dataUrl = await toPng(node, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true });
        const link = document.createElement('a');
        const cleanName = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        link.download = `${cleanName}_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
        setStatus('downloaded');
      }

      setTimeout(() => {
        setStatus('idle');
      }, 2000);

    } catch (err) {
      console.error('Erro ao copiar gráfico:', err);
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  const getTooltipText = () => {
    switch (status) {
      case 'copying': return 'Gerando imagem...';
      case 'copied': return 'Copiado para a área de transferência!';
      case 'downloaded': return 'Imagem baixada!';
      case 'error': return 'Erro ao copiar gráfico';
      default: return 'Copiar gráfico (Ctrl+V para colar na apresentação)';
    }
  };

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        onClick={handleCopy}
        disabled={status === 'copying'}
        title={getTooltipText()}
        aria-label="Copiar gráfico"
        className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 shadow-2xs flex items-center justify-center shrink-0 ${
          status === 'copied' || status === 'downloaded'
            ? 'bg-[#00E04B]/15 text-[#006E24] border-[#00E04B]/50 ring-2 ring-[#00E04B]/30'
            : status === 'error'
            ? 'bg-[#FD3168]/15 text-[#FD3168] border-[#FD3168]/40'
            : 'bg-white hover:bg-[#D9FBFF] text-[#004A6D] hover:text-[#002A3A] border-[#BCD3DF] hover:border-[#00E3E6]'
        } ${className}`}
      >
        {status === 'copying' ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#004A6D]" />
        ) : status === 'copied' || status === 'downloaded' ? (
          <Check className="w-4 h-4 text-[#006E24]" />
        ) : status === 'error' ? (
          <Copy className="w-4 h-4 text-[#FD3168]" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {/* Tooltip Popup on Hover */}
      <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center gap-1 bg-[#002A3A] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in duration-150">
        <span>{getTooltipText()}</span>
      </div>
    </div>
  );
};
