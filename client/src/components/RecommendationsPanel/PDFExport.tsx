import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';

// ── File System Access API type declarations ──────────────────
// (Not yet in all TS lib versions, so we declare them manually)
interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
  excludeAcceptAllOption?: boolean;
}

declare global {
  interface Window {
    showSaveFilePicker?: (opts?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
  }
}

// ── Helper: save a Uint8Array as PDF via Save-As dialog ──────
async function saveWithDialog(pdfBuffer: ArrayBuffer, suggestedName: string): Promise<void> {
  if (typeof window.showSaveFilePicker === 'function') {
    // ✅ Modern browsers (Chrome 86+, Edge 86+) — native OS Save-As dialog
    const fileHandle = await window.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: 'PDF Document',
          accept: { 'application/pdf': ['.pdf'] },
        },
      ],
      excludeAcceptAllOption: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(pdfBuffer);
    await writable.close();
  } else {
    // 🔁 Fallback — auto-download (Firefox, Safari, older browsers)
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ─────────────────────────────────────────────────────────────

export default function PDFExport() {
  const { state } = useApp();
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'rendering' | 'saving' | 'done' | 'error'>('idle');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setGenerating(true);
    setStatus('rendering');

    try {
      // Dynamically import jsPDF + html2canvas (keeps initial bundle lean)
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const { district, crop, stage, analysisResult, recommendations, language } = state;
      const rs = analysisResult?.riskScores;

      // ── Build off-screen report element ──────────────────────
      const reportEl = document.createElement('div');
      reportEl.style.cssText = `
        width: 680px;
        padding: 48px 40px;
        background: #071407;
        color: white;
        font-family: Inter, Arial, sans-serif;
        position: fixed;
        top: -9999px;
        left: 0;
      `;

      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
      });

      const compositeColor =
        rs?.composite.level === 'critical' ? '#ef4444'
        : rs?.composite.level === 'at-risk' ? '#f97316'
        : '#22c55e';

      reportEl.innerHTML = `
        <!-- HEADER -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:24px; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:28px;">
          <div>
            <div style="font-size:24px; font-weight:800; color:#22c55e; font-family:Arial,sans-serif; letter-spacing:-0.02em;">
              🌾 FasalRakshak
            </div>
            <div style="font-size:12px; color:rgba(255,255,255,0.4); margin-top:4px; letter-spacing:0.04em;">
              SMART FARM RISK REPORT
            </div>
          </div>
          <div style="text-align:right; font-size:12px; color:rgba(255,255,255,0.4);">
            <div>${dateStr}</div>
            <div style="margin-top:3px; color:rgba(255,255,255,0.25);">ಫಸಲ್ ರಕ್ಷಕ · Crop Guardian</div>
          </div>
        </div>

        <!-- FIELD DETAILS -->
        <div style="background:rgba(34,197,94,0.06); border:1px solid rgba(34,197,94,0.15); border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="font-size:10px; font-weight:700; letter-spacing:0.12em; color:rgba(34,197,94,0.7); margin-bottom:14px;">FIELD DETAILS</div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
            <div>
              <div style="font-size:10px; color:rgba(255,255,255,0.4); margin-bottom:4px;">DISTRICT</div>
              <div style="font-weight:600; color:white; font-size:14px;">${district?.name ?? '—'}</div>
              <div style="font-size:11px; color:rgba(255,255,255,0.35);">${district?.state ?? ''}</div>
            </div>
            <div>
              <div style="font-size:10px; color:rgba(255,255,255,0.4); margin-bottom:4px;">CROP</div>
              <div style="font-weight:600; color:white; font-size:14px;">${crop?.icon ?? ''} ${crop?.name.en ?? '—'}</div>
              <div style="font-size:11px; color:rgba(255,255,255,0.35);">${crop?.name.kn ?? ''}</div>
            </div>
            <div>
              <div style="font-size:10px; color:rgba(255,255,255,0.4); margin-bottom:4px;">GROWTH STAGE</div>
              <div style="font-weight:600; color:white; font-size:14px;">${stage?.icon ?? ''} ${stage?.name.en ?? '—'}</div>
              <div style="font-size:11px; color:rgba(255,255,255,0.35);">${stage?.name.kn ?? ''}</div>
            </div>
          </div>
        </div>

        <!-- RISK SCORES -->
        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="font-size:10px; font-weight:700; letter-spacing:0.12em; color:rgba(255,255,255,0.4); margin-bottom:16px;">RISK ANALYSIS</div>
          
          <div style="display:flex; align-items:center; gap:20px; margin-bottom:20px; padding:16px; background:rgba(255,255,255,0.03); border-radius:10px;">
            <div style="text-align:center; flex-shrink:0;">
              <div style="font-size:44px; font-weight:900; color:${compositeColor}; font-family:Arial,sans-serif; line-height:1;">${rs?.composite.score ?? '--'}</div>
              <div style="font-size:10px; color:rgba(255,255,255,0.4); margin-top:2px;">/ 100</div>
            </div>
            <div>
              <div style="font-size:18px; font-weight:800; color:${compositeColor}; letter-spacing:0.04em;">${(rs?.composite.level ?? '').toUpperCase().replace('-', ' ')}</div>
              <div style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:4px; line-height:1.5;">Composite risk score combining drought stress,<br>pest pressure, and nutrient deficiency.</div>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
            <div style="text-align:center; background:rgba(249,115,22,0.08); border:1px solid rgba(249,115,22,0.2); border-radius:10px; padding:14px;">
              <div style="font-size:28px; font-weight:800; color:#f97316;">${rs?.droughtStress.score ?? '--'}</div>
              <div style="font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:#f97316; margin-top:2px;">${rs?.droughtStress.level ?? ''}</div>
              <div style="font-size:10px; color:rgba(255,255,255,0.45); margin-top:6px;">☀️ Drought Stress</div>
            </div>
            <div style="text-align:center; background:rgba(167,139,250,0.08); border:1px solid rgba(167,139,250,0.2); border-radius:10px; padding:14px;">
              <div style="font-size:28px; font-weight:800; color:#a78bfa;">${rs?.pestPressure.score ?? '--'}</div>
              <div style="font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:#a78bfa; margin-top:2px;">${rs?.pestPressure.level ?? ''}</div>
              <div style="font-size:10px; color:rgba(255,255,255,0.45); margin-top:6px;">🐛 Pest Pressure</div>
            </div>
            <div style="text-align:center; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:10px; padding:14px;">
              <div style="font-size:28px; font-weight:800; color:#22c55e;">${rs?.nutrientDeficiency.score ?? '--'}</div>
              <div style="font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:#22c55e; margin-top:2px;">${rs?.nutrientDeficiency.level ?? ''}</div>
              <div style="font-size:10px; color:rgba(255,255,255,0.45); margin-top:6px;">🌱 Nutrient Deficit</div>
            </div>
          </div>
        </div>

        <!-- WEATHER -->
        ${analysisResult ? `
        <div style="background:rgba(56,189,248,0.05); border:1px solid rgba(56,189,248,0.12); border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="font-size:10px; font-weight:700; letter-spacing:0.12em; color:rgba(56,189,248,0.7); margin-bottom:14px;">CURRENT WEATHER CONDITIONS</div>
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px;">
            <div style="text-align:center;">
              <div style="font-size:18px; margin-bottom:4px;">🌡️</div>
              <div style="font-weight:700; color:#f97316; font-size:16px;">${analysisResult.weather.current.temperature.max}°C</div>
              <div style="font-size:10px; color:rgba(255,255,255,0.4);">Max Temp</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:18px; margin-bottom:4px;">💧</div>
              <div style="font-weight:700; color:#38bdf8; font-size:16px;">${analysisResult.weather.current.humidity.value}%</div>
              <div style="font-size:10px; color:rgba(255,255,255,0.4);">Humidity</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:18px; margin-bottom:4px;">🌧️</div>
              <div style="font-weight:700; color:#818cf8; font-size:16px;">${analysisResult.weather.current.precipitation.value}mm</div>
              <div style="font-size:10px; color:rgba(255,255,255,0.4);">Rainfall</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:18px; margin-bottom:4px;">🛰️</div>
              <div style="font-weight:700; color:${analysisResult.ndvi.status === 'healthy' ? '#4ade80' : analysisResult.ndvi.status === 'stressed' ? '#facc15' : '#ef4444'}; font-size:16px;">${analysisResult.ndvi.value.toFixed(2)}</div>
              <div style="font-size:10px; color:rgba(255,255,255,0.4);">NDVI</div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- RECOMMENDATIONS -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:20px; margin-bottom:24px;">
          <div style="font-size:10px; font-weight:700; letter-spacing:0.12em; color:rgba(255,255,255,0.4); margin-bottom:16px;">SMART RECOMMENDATIONS</div>
          ${recommendations.map((r, idx) => `
            <div style="
              margin-bottom:${idx < recommendations.length - 1 ? '12px' : '0'};
              padding:14px 16px;
              background:rgba(255,255,255,0.03);
              border-radius:10px;
              border-left:3px solid ${r.priority === 'high' ? '#ef4444' : r.priority === 'medium' ? '#facc15' : '#22c55e'};
            ">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="font-size:9px; font-weight:700; letter-spacing:0.1em; padding:2px 8px; border-radius:99px; background:${r.priority === 'high' ? 'rgba(239,68,68,0.15)' : r.priority === 'medium' ? 'rgba(250,204,21,0.15)' : 'rgba(34,197,94,0.15)'}; color:${r.priority === 'high' ? '#f87171' : r.priority === 'medium' ? '#fde047' : '#4ade80'};">
                  ${r.priority.toUpperCase()}
                </span>
                <div style="font-weight:600; color:white; font-size:13px;">${r.title[language]}</div>
              </div>
              <div style="font-size:12px; color:rgba(255,255,255,0.6); line-height:1.6;">${r.description[language]}</div>
              <div style="margin-top:8px; display:flex; gap:12px; flex-wrap:wrap;">
                ${r.quantity ? `<span style="font-size:11px; color:rgba(255,255,255,0.4);">📦 ${r.quantity}</span>` : ''}
                ${r.timing ? `<span style="font-size:11px; color:rgba(255,255,255,0.4);">⏰ ${r.timing}</span>` : ''}
                ${r.estimatedCost && r.estimatedCost > 0 ? `<span style="font-size:11px; color:#fde047;">₹${r.estimatedCost} ${r.estimatedCostUnit ?? ''}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- FOOTER -->
        <div style="text-align:center; padding-top:20px; border-top:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:10px; color:rgba(255,255,255,0.25); line-height:1.6;">
            Generated by FasalRakshak AI · For advisory purposes only · Always consult a local agronomist for critical decisions<br>
            © ${new Date().getFullYear()} FasalRakshak — Hyper-Local Crop Failure Predictor
          </div>
        </div>
      `;

      document.body.appendChild(reportEl);

      // ── Render to canvas ──────────────────────────────────────
      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#071407',
        logging: false,
        windowWidth: 680,
      });

      document.body.removeChild(reportEl);

      // ── Build PDF ─────────────────────────────────────────────
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;

      // Multi-page support if report exceeds one A4 page
      const pageHeightMm = pdf.internal.pageSize.getHeight();
      if (imgHeightMm > pageHeightMm) {
        let yOffset = 0;
        while (yOffset < imgHeightMm) {
          if (yOffset > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, imgHeightMm);
          yOffset += pageHeightMm;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightMm);
      }

      // ── Suggested filename ────────────────────────────────────
      const dateTag = new Date()
        .toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .replace(/\//g, '-');
      const suggestedName = `FasalRakshak_Report_${district?.name ?? 'Farm'}_${crop?.name.en ?? 'Crop'}_${dateTag}.pdf`;

      // ── Get raw bytes then show Save-As dialog ────────────────
      setStatus('saving');
      const pdfBuffer = pdf.output('arraybuffer') as ArrayBuffer;
      await saveWithDialog(pdfBuffer, suggestedName);

      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      // User cancelled the save dialog → not a real error
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle');
      } else {
        console.error('PDF generation failed:', err);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } finally {
      setGenerating(false);
    }
  };

  // ── Button label based on status ─────────────────────────────
  const buttonLabel = {
    idle: '📄 Download Smart Farm Report',
    rendering: '🖼️ Rendering report...',
    saving: '💾 Choose save location...',
    done: '✅ Report saved!',
    error: '❌ Save failed — try again',
  }[status];

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    justifyContent: 'center',
    ...(status === 'done' ? { background: 'linear-gradient(135deg,#22c55e,#16a34a)' } : {}),
    ...(status === 'error' ? { background: 'linear-gradient(135deg,#ef4444,#dc2626)' } : {}),
  };

  return (
    <div ref={reportRef}>
      <button
        id="download-pdf-btn"
        className="btn-pdf"
        onClick={handleDownload}
        disabled={generating}
        style={buttonStyle}
      >
        {generating
          ? <><span style={{ display: 'inline-block', animation: 'spin-slow 1s linear infinite' }}>⚙️</span> {buttonLabel}</>
          : buttonLabel
        }
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
        {status === 'saving'
          ? '⬆️ Native save dialog opening — choose your folder'
          : 'PDF report with risk scores, forecast & recommendations'}
      </p>
    </div>
  );
}
