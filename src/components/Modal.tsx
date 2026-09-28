import React, { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { StudioDrawer } from './StudioDrawer';
import { isOptimizedForEdits } from '../core/registry';
import { downloadFile } from '../core/export';
import { formatItemTitle } from '../core/math';

export const Modal: React.FC = () => {
  const {
    isModalOpen,
    modalItems,
    currentModalIndex,
    isStudioOpen,
    currentWorkingSvg,
    showBounds,
    altBg,
    zoomMode,
    closeModal,
    nextModal,
    prevModal,
    toggleStudio,
    toggleBounds,
    toggleAltBg,
    setZoomMode,
    showToast,
    undoParam,
    redoParam
  } = useAppStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isModalOpen) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      prevModal();
    } else if (e.key === 'ArrowRight') {
      nextModal();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redoParam();
      } else {
        undoParam();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      redoParam();
    }
  }, [isModalOpen, closeModal, prevModal, nextModal, undoParam, redoParam]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isModalOpen || modalItems.length === 0) return null;

  const currentItem = modalItems[currentModalIndex];
  if (!currentItem) return null;

  const canEdit = isOptimizedForEdits(currentItem);
  const title = formatItemTitle(currentItem);
  const cat = (currentItem.category || (currentItem as any).category_label || '').toUpperCase();
  const id = ((currentItem as any).id || (currentItem as any).collection_id || '').toUpperCase();
  const fileSvg = currentItem.primary_file || (currentItem as any).file;
  const pngFile = (currentItem as any).png_file || (fileSvg ? fileSvg.replace(/\.svg$/, '.png').replace('assets/svg/', 'assets/png/') : '');

  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(currentWorkingSvg);
      showToast(`COPIED ${title}`);
    } catch {
      showToast('COPY FAILED');
    }
  };

  const handleDownloadSvg = () => {
    downloadFile(currentWorkingSvg, `${title}.svg`, 'image/svg+xml');
    showToast('DOWNLOADED SVG');
  };

  return (
    <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-info">
            <span className="modal-title">{title}</span>
            <span className="modal-meta">
              {id && `${id}  |  `}{cat}  ({currentModalIndex + 1} OF {modalItems.length})
            </span>
          </div>

          <div className="modal-actions">
            {modalItems.length > 1 && (
              <>
                <button className="btn" onClick={prevModal}>&larr; PREV</button>
                <button className="btn" onClick={nextModal}>NEXT &rarr;</button>
              </>
            )}

            {canEdit && (
              <button
                className={`btn ${isStudioOpen ? 'active' : ''}`}
                onClick={() => toggleStudio()}
              >
                {isStudioOpen ? 'HIDE STUDIO' : 'LIVE STUDIO'}
              </button>
            )}

            <button className="btn" onClick={handleCopySvg}>COPY SVG</button>
            <button className="btn" onClick={handleDownloadSvg}>SVG</button>
            {pngFile && (
              <a
                href={pngFile}
                download={`${title}.png`}
                className="btn"
              >
                PNG
              </a>
            )}
            <button className="btn" onClick={closeModal}>&#x2715; CLOSE</button>
          </div>
        </div>

        <div className="modal-body">
          <div className="stage-area">
            {isStudioOpen && (
              <div className="stage-toolbar">
                <button
                  className={`btn ${showBounds ? 'active' : ''}`}
                  onClick={toggleBounds}
                >
                  BOUNDS: {showBounds ? 'ON' : 'OFF'}
                </button>
                <button
                  className={`btn ${altBg ? 'active' : ''}`}
                  onClick={toggleAltBg}
                >
                  INVERT BG
                </button>
                <button
                  className={`btn ${zoomMode === 'fit' ? 'active' : ''}`}
                  onClick={() => setZoomMode('fit')}
                >
                  FIT
                </button>
                <button
                  className={`btn ${zoomMode === '100' ? 'active' : ''}`}
                  onClick={() => setZoomMode('100')}
                >
                  512PX
                </button>
              </div>
            )}

            <div className="svg-stage-container" onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}>
              <div
                className={`svg-canvas ${showBounds ? 'show-bounds' : ''} ${altBg ? 'alt-bg' : ''}`}
                style={zoomMode === '100' ? { width: '512px', height: '512px' } : {}}
                dangerouslySetInnerHTML={{ __html: currentWorkingSvg }}
              />
            </div>
          </div>

          <StudioDrawer />
        </div>
      </div>
    </div>
  );
};
