import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { rasterizeSvgToPng, svgToReactJsx, downloadFile } from '../core/export';

export const StudioDrawer: React.FC = () => {
  const {
    isStudioOpen,
    studioTab,
    activeDescriptor,
    parametricValues,
    transformParams,
    currentWorkingSvg,
    modalItems,
    currentModalIndex,
    setStudioTab,
    setParametricValue,
    randomizeParameters,
    setTransformParam,
    setWorkingSvgCode,
    resetToOriginal,
    saveToLibrary,
    showToast
  } = useAppStore();

  if (!isStudioOpen) return null;

  const currentItem = modalItems[currentModalIndex];
  const assetName = currentItem ? ((currentItem as any).title || (currentItem as any).name || 'asset') : 'asset';

  const handleExportPng = async () => {
    if (!currentWorkingSvg) return;
    try {
      const pngUrl = await rasterizeSvgToPng(currentWorkingSvg, 1024);
      const link = document.createElement('a');
      link.download = `${assetName}_studio.png`;
      link.href = pngUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('EXPORTED 1024X1024 PNG');
    } catch {
      showToast('PNG EXPORT FAILED');
    }
  };

  const handleCopyJsx = async () => {
    if (!currentWorkingSvg) return;
    try {
      const jsx = svgToReactJsx(currentWorkingSvg, assetName);
      await navigator.clipboard.writeText(jsx);
      showToast('COPIED REACT JSX COMPONENT');
    } catch {
      showToast('COPY JSX FAILED');
    }
  };

  const handleDownloadSvg = () => {
    if (!currentWorkingSvg) return;
    downloadFile(currentWorkingSvg, `${assetName}_studio.svg`, 'image/svg+xml');
    showToast('DOWNLOADED SVG');
  };

  return (
    <div className={`editor-drawer ${isStudioOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <div className="drawer-tabs">
          <button
            className={`btn ${studioTab === 'controls' ? 'active' : ''}`}
            onClick={() => setStudioTab('controls')}
          >
            CONTROLS
          </button>
          <button
            className={`btn ${studioTab === 'code' ? 'active' : ''}`}
            onClick={() => setStudioTab('code')}
          >
            RAW SVG
          </button>
        </div>
      </div>

      {studioTab === 'controls' ? (
        <div className="drawer-content">
          {/* PARAMETRIC CONTROLS SECTION */}
          {activeDescriptor && activeDescriptor.optimized && (
            <div
              className="control-group"
              style={{
                paddingBottom: '10px',
                marginBottom: '6px',
                borderBottom: '1px solid var(--fg)'
              }}
            >
              <div
                className="control-label"
                style={{
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, letterSpacing: '0.05em' }}>
                    {activeDescriptor.label}
                  </span>
                  <span style={{ opacity: 0.6, fontSize: '9px', marginLeft: '4px' }}>
                    PARAMETRIC
                  </span>
                </div>
                <button
                  className="btn"
                  style={{ fontSize: '10px', height: '22px', padding: '2px 6px' }}
                  title="Randomize generator math parameters"
                  onClick={randomizeParameters}
                >
                  RANDOMIZE
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeDescriptor.controls.map(ctrl => {
                  const val = parametricValues[ctrl.key] ?? activeDescriptor.defaults[ctrl.key];
                  return (
                    <div key={ctrl.key} className="control-group" style={{ margin: '2px 0' }}>
                      <div className="control-label">
                        <span>{ctrl.label}</span>
                        <span>{val}{ctrl.unit || ''}</span>
                      </div>
                      <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step || 1}
                        value={val}
                        onChange={(e) => {
                          const nVal = ctrl.step && ctrl.step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
                          setParametricValue(ctrl.key, nVal);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCALE */}
          <div className="control-group">
            <div className="control-label">
              <span>SCALE</span>
              <span>{transformParams.scale}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="180"
              value={transformParams.scale}
              onChange={(e) => setTransformParam('scale', parseInt(e.target.value, 10))}
            />
          </div>

          {/* WIDTH / HEIGHT STRETCH */}
          <div className="control-group">
            <div className="control-label">
              <span>WIDTH / HEIGHT STRETCH</span>
              <span>{transformParams.stretchX}% &times; {transformParams.stretchY}%</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', opacity: 0.6, marginBottom: '2px' }}>
                  WIDTH X: {transformParams.stretchX}%
                </div>
                <input
                  type="range"
                  min="30"
                  max="250"
                  value={transformParams.stretchX}
                  onChange={(e) => setTransformParam('stretchX', parseInt(e.target.value, 10))}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', opacity: 0.6, marginBottom: '2px' }}>
                  HEIGHT Y: {transformParams.stretchY}%
                </div>
                <input
                  type="range"
                  min="30"
                  max="250"
                  value={transformParams.stretchY}
                  onChange={(e) => setTransformParam('stretchY', parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          </div>

          {/* STROKE WIDTH */}
          <div className="control-group">
            <div className="control-label">
              <span>STROKE WIDTH</span>
              <span>{transformParams.strokeWidth === 0 ? 'ORIGINAL' : `${transformParams.strokeWidth}PX`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={transformParams.strokeWidth}
              onChange={(e) => setTransformParam('strokeWidth', parseInt(e.target.value, 10))}
            />
          </div>

          {/* CORNER JOIN */}
          <div className="control-group">
            <div className="control-label">
              <span>CORNER JOIN</span>
              <span>{transformParams.cornerJoin.toUpperCase()}</span>
            </div>
            <div className="quick-btn-row">
              <button
                className={`btn ${transformParams.cornerJoin === 'orig' ? 'active' : ''}`}
                onClick={() => setTransformParam('cornerJoin', 'orig')}
              >
                ORIG
              </button>
              <button
                className={`btn ${transformParams.cornerJoin === 'miter' ? 'active' : ''}`}
                onClick={() => setTransformParam('cornerJoin', 'miter')}
              >
                MITER
              </button>
              <button
                className={`btn ${transformParams.cornerJoin === 'round' ? 'active' : ''}`}
                onClick={() => setTransformParam('cornerJoin', 'round')}
              >
                ROUND
              </button>
              <button
                className={`btn ${transformParams.cornerJoin === 'bevel' ? 'active' : ''}`}
                onClick={() => setTransformParam('cornerJoin', 'bevel')}
              >
                BEVEL
              </button>
            </div>
          </div>

          {/* STROKE DASH PATTERN */}
          <div className="control-group">
            <div className="control-label">
              <span>STROKE DASH PATTERN</span>
              <span>{transformParams.dashPattern.toUpperCase()}</span>
            </div>
            <div className="quick-btn-row">
              <button
                className={`btn ${transformParams.dashPattern === 'solid' ? 'active' : ''}`}
                onClick={() => setTransformParam('dashPattern', 'solid')}
              >
                SOLID
              </button>
              <button
                className={`btn ${transformParams.dashPattern === 'dashed' ? 'active' : ''}`}
                onClick={() => setTransformParam('dashPattern', 'dashed')}
              >
                DASHED
              </button>
              <button
                className={`btn ${transformParams.dashPattern === 'dotted' ? 'active' : ''}`}
                onClick={() => setTransformParam('dashPattern', 'dotted')}
              >
                DOTTED
              </button>
            </div>
          </div>

          {/* ROTATION */}
          <div className="control-group">
            <div className="control-label">
              <span>ROTATION</span>
              <span>{transformParams.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={transformParams.rotation}
              onChange={(e) => setTransformParam('rotation', parseInt(e.target.value, 10))}
            />
            <div className="quick-btn-row">
              <button
                className="btn"
                onClick={() => {
                  let r = (transformParams.rotation - 90 + 360) % 360;
                  if (r > 180) r -= 360;
                  setTransformParam('rotation', r);
                }}
              >
                -90°
              </button>
              <button
                className="btn"
                onClick={() => setTransformParam('rotation', 0)}
              >
                0°
              </button>
              <button
                className="btn"
                onClick={() => {
                  let r = (transformParams.rotation + 90) % 360;
                  if (r > 180) r -= 360;
                  setTransformParam('rotation', r);
                }}
              >
                +90°
              </button>
            </div>
          </div>

          {/* PAN X / Y */}
          <div className="control-group">
            <div className="control-label">
              <span>PAN X / Y</span>
              <span>{transformParams.panX}, {transformParams.panY}</span>
            </div>
            <div className="quick-btn-row">
              <button className="btn" onClick={() => setTransformParam('panX', transformParams.panX - 16)}>&larr;</button>
              <button className="btn" onClick={() => setTransformParam('panY', transformParams.panY - 16)}>&uarr;</button>
              <button className="btn" onClick={() => setTransformParam('panY', transformParams.panY + 16)}>&darr;</button>
              <button className="btn" onClick={() => setTransformParam('panX', transformParams.panX + 16)}>&rarr;</button>
              <button
                className="btn"
                onClick={() => {
                  setTransformParam('panX', 0);
                  setTransformParam('panY', 0);
                }}
              >
                CENTER
              </button>
            </div>
          </div>

          {/* STYLE MODES */}
          <div className="control-group">
            <div className="control-label">
              <span>STYLE MODES</span>
            </div>
            <div className="quick-btn-row">
              <button
                className={`btn ${transformParams.invertFill ? 'active' : ''}`}
                onClick={() => setTransformParam('invertFill', !transformParams.invertFill)}
              >
                FILL / OUTLINE
              </button>
              <button
                className={`btn ${transformParams.flipH ? 'active' : ''}`}
                onClick={() => setTransformParam('flipH', !transformParams.flipH)}
              >
                FLIP H
              </button>
              <button
                className={`btn ${transformParams.flipV ? 'active' : ''}`}
                onClick={() => setTransformParam('flipV', !transformParams.flipV)}
              >
                FLIP V
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="drawer-content">
          <textarea
            id="svgCodeEditor"
            spellCheck={false}
            value={currentWorkingSvg}
            onChange={(e) => setWorkingSvgCode(e.target.value)}
          />
        </div>
      )}

      <div className="drawer-footer">
        <button className="btn" onClick={resetToOriginal}>RESET TO ORIGINAL</button>
        <button className="btn" onClick={saveToLibrary}>SAVE TO LIBRARY</button>
        <button className="btn" onClick={handleCopyJsx}>COPY REACT JSX</button>
        <button className="btn" onClick={handleDownloadSvg}>DOWNLOAD SVG</button>
        <button className="btn" onClick={handleExportPng}>EXPORT 1024 PNG</button>
      </div>
    </div>
  );
};
