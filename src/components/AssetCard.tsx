import React from 'react';
import { AssetItem, CollectionItem } from '../core/types';
import { isOptimizedForEdits } from '../core/registry';
import { useAppStore } from '../store/useAppStore';
import { formatItemTitle } from '../core/math';

interface AssetCardProps {
  item: AssetItem | CollectionItem;
  itemsList: (AssetItem | CollectionItem)[];
  isCollection?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({ item, itemsList, isCollection = false }) => {
  const { openModal, setActiveCollection, showToast } = useAppStore();

  const title = formatItemTitle(item);
  const rawSvg = item.primary_svg || (item as any).svg || '';
  const svgFile = item.primary_file || (item as any).file || '';
  const pngFile = (item as any).png_file || (svgFile ? svgFile.replace(/\.svg$/, '.png').replace('assets/svg/', 'assets/png/') : '');
  const canEdit = !isCollection && isOptimizedForEdits(item);

  const handleCardClick = () => {
    if (isCollection) {
      setActiveCollection(item as CollectionItem);
    } else {
      openModal(item, false, itemsList);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(item, true, itemsList);
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(item, false, itemsList);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(rawSvg);
      showToast(`COPIED ${title}`);
    } catch {
      showToast('COPY FAILED');
    }
  };

  return (
    <div className="card" onClick={handleCardClick}>
      {canEdit && (
        <button
          className="card-edit-btn"
          title="Edit in Live Studio"
          onClick={handleEditClick}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      )}

      <button
        className="card-zoom-btn"
        title="Full size preview"
        onClick={handleZoomClick}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.5" y1="15.5" x2="21" y2="21" />
        </svg>
      </button>

      <div
        className="preview"
        dangerouslySetInnerHTML={{ __html: rawSvg }}
      />

      <div className="card-footer">
        <div className="card-title" title={title}>{title}</div>
        <div className="card-sub">
          {isCollection ? (
            <>
              <span>{(item as CollectionItem).count} STYLES</span>
              <span>{((item as CollectionItem).category_label || '').toUpperCase()}</span>
            </>
          ) : (
            <>
              <span>{((item as any).id || (item as AssetItem).collection_id || '').toUpperCase()}</span>
              <span>{((item as any).category_label || (item as AssetItem).collection_title || item.category || '').toUpperCase()}</span>
            </>
          )}
        </div>

        {!isCollection && (
          <div className="card-actions">
            <button className="btn" onClick={handleCopy}>COPY</button>
            {svgFile && (
              <a
                href={svgFile}
                download={`${title}.svg`}
                className="btn"
                onClick={(e) => e.stopPropagation()}
              >
                SVG
              </a>
            )}
            {pngFile && (
              <a
                href={pngFile}
                download={`${title}.png`}
                className="btn"
                onClick={(e) => e.stopPropagation()}
              >
                PNG
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
