import { create } from 'zustand';
import {
  AssetItem,
  CollectionItem,
  ManifestSummary,
  ParametricDescriptor,
  StudioTransformParams
} from '../core/types';
import { detectParametricFeatures, isOptimizedForEdits } from '../core/registry';
import { applySvgTransforms } from '../core/export';
import {
  getRouteFromLocation,
  navigateToGroup,
  navigateToCategory,
  navigateToAll,
  navigateToHome,
  navigateToLicense,
  navigateToFaq,
  getAssetUrl
} from '../core/router';

const DEFAULT_TRANSFORMS: StudioTransformParams = {
  scale: 100,
  stretchX: 100,
  stretchY: 100,
  strokeWidth: 0,
  cornerJoin: 'orig',
  dashPattern: 'solid',
  rotation: 0,
  panX: 0,
  panY: 0,
  invertFill: false,
  flipH: false,
  flipV: false
};

interface AppState {
  // Data
  summary: ManifestSummary | null;
  loadedCategories: Record<string, AssetItem[]>;
  categoryCollections: Record<string, CollectionItem[]>;
  allShapes: AssetItem[];
  isLoading: boolean;

  // Navigation & Filtering
  activeCategory: string; // 'all' or category ID
  viewMode: 'groups' | 'all' | 'group_detail';
  activeCollection: CollectionItem | null;
  searchQuery: string;
  theme: 'dark' | 'light';

  // Modal & Studio State
  isModalOpen: boolean;
  isDownloadModalOpen: boolean;
  activeInfoModal: 'license' | 'faq' | null;
  modalItems: (AssetItem | CollectionItem)[];
  currentModalIndex: number;
  isStudioOpen: boolean;
  studioTab: 'controls' | 'code';
  
  // Active Asset SVG & Math
  currentOriginalSvg: string;
  currentWorkingSvg: string;
  activeDescriptor: ParametricDescriptor | null;
  parametricValues: Record<string, any>;
  transformParams: StudioTransformParams;
  paramHistory: Record<string, any>[];
  historyIndex: number;

  // Viewport / Stage Settings
  showBounds: boolean;
  altBg: boolean;
  zoomMode: 'fit' | '100';
  toast: string | null;

  // Actions
  loadInitialData: () => Promise<void>;
  syncFromUrl: (pushState?: boolean) => Promise<void>;
  loadCategoryChunk: (categoryId: string) => Promise<AssetItem[]>;
  setActiveCategory: (cat: string, pushUrl?: boolean) => void;
  setViewMode: (mode: 'groups' | 'all' | 'group_detail', pushUrl?: boolean) => void;
  setActiveCollection: (col: CollectionItem | null, pushUrl?: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;
  showToast: (msg: string) => void;

  // Modal Actions
  openModal: (item: AssetItem | CollectionItem, openStudio?: boolean, list?: (AssetItem | CollectionItem)[]) => void;
  closeModal: () => void;
  openDownloadModal: () => void;
  closeDownloadModal: () => void;
  openInfoModal: (type: 'license' | 'faq') => void;
  closeInfoModal: () => void;
  nextModal: () => void;
  prevModal: () => void;
  toggleStudio: (force?: boolean) => void;
  setStudioTab: (tab: 'controls' | 'code') => void;

  // Studio Manipulation Actions
  setParametricValue: (key: string, value: any) => void;
  randomizeParameters: () => void;
  setTransformParam: <K extends keyof StudioTransformParams>(key: K, value: StudioTransformParams[K]) => void;
  setWorkingSvgCode: (code: string) => void;
  resetToOriginal: () => void;
  saveToLibrary: () => void;
  undoParam: () => void;
  redoParam: () => void;
  toggleBounds: () => void;
  toggleAltBg: () => void;
  setZoomMode: (mode: 'fit' | '100') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  summary: null,
  loadedCategories: {},
  categoryCollections: {},
  allShapes: [],
  isLoading: true,

  activeCategory: 'all',
  viewMode: 'groups',
  activeCollection: null,
  searchQuery: '',
  theme: 'dark',

  isModalOpen: false,
  isDownloadModalOpen: false,
  activeInfoModal: null,
  modalItems: [],
  currentModalIndex: 0,
  isStudioOpen: false,
  studioTab: 'controls',

  currentOriginalSvg: '',
  currentWorkingSvg: '',
  activeDescriptor: null,
  parametricValues: {},
  transformParams: { ...DEFAULT_TRANSFORMS },
  paramHistory: [],
  historyIndex: -1,

  showBounds: true,
  altBg: false,
  zoomMode: 'fit',
  toast: null,

  loadInitialData: async () => {
    if (typeof window === 'undefined') return;
    try {
      set({ isLoading: true });
      const res = await fetch(getAssetUrl('assets/data/manifest_summary.json'));
      if (res.ok) {
        const data: ManifestSummary = await res.json();
        set({ summary: data, isLoading: false });
        await get().syncFromUrl(false);
      }
      fetch(getAssetUrl('manifest.json'))
        .then(r => r.json())
        .then(full => {
          if (full && full.assets) {
            set({ allShapes: full.assets });
          }
        })
        .catch(() => {});
    } catch (e) {
      console.error('Failed to load initial data:', e);
      set({ isLoading: false });
    }
  },

  syncFromUrl: async (pushState = false) => {
    const { summary } = get();
    const route = getRouteFromLocation();
    if (route.type === 'license') {
      set({ activeInfoModal: 'license' });
      return;
    }

    if (route.type === 'faq') {
      set({ activeInfoModal: 'faq' });
      return;
    }

    if (!summary) return;

    if (route.type === 'group' && route.groupId) {
      const col = summary.collections.find(c => c.id.toLowerCase() === route.groupId);
      if (col) {
        await get().setActiveCollection(col, pushState);
        return;
      }
    }

    if (route.type === 'category' && route.categoryId) {
      get().setActiveCategory(route.categoryId, pushState);
      return;
    }

    if (route.type === 'all') {
      get().setViewMode('all', pushState);
      return;
    }

    // Default: home
    set({ activeCollection: null, activeCategory: 'all', viewMode: 'groups' });
    if (pushState) {
      navigateToHome();
    } else if (typeof document !== 'undefined') {
      document.title = 'AssetLib';
    }
  },

  loadCategoryChunk: async (categoryId: string) => {
    if (typeof window === 'undefined') return [];
    const { loadedCategories } = get();
    if (loadedCategories[categoryId] && loadedCategories[categoryId].length > 0) {
      return loadedCategories[categoryId];
    }
    try {
      const res = await fetch(getAssetUrl(`assets/data/categories/${categoryId}.json`));
      if (res.ok) {
        const data = await res.json();
        const shapes: AssetItem[] = data.assets || data.shapes || [];
        const collections: CollectionItem[] = data.collections || [];
        set(state => ({
          loadedCategories: { ...state.loadedCategories, [categoryId]: shapes },
          categoryCollections: {
            ...state.categoryCollections,
            [categoryId]: collections
          },
          allShapes: [...state.allShapes, ...shapes]
        }));
        return shapes;
      }
    } catch (e) {
      console.warn(`Category chunk ${categoryId} not loaded:`, e);
    }
    return [];
  },

  setActiveCategory: (cat: string, pushUrl = true) => {
    set({ activeCategory: cat, activeCollection: null, viewMode: 'groups' });
    if (pushUrl) {
      if (cat === 'all') {
        navigateToHome();
      } else {
        const title = get().summary?.categories[cat]?.title;
        navigateToCategory(cat, title);
      }
    } else if (typeof document !== 'undefined') {
      const title = cat === 'all'
        ? 'AssetLib'
        : `${get().summary?.categories[cat]?.title || cat} • AssetLib`;
      document.title = title;
    }
    if (cat !== 'all') {
      get().loadCategoryChunk(cat);
    }
  },

  setViewMode: (mode, pushUrl = true) => {
    set({ viewMode: mode });
    if (pushUrl) {
      if (mode === 'all') {
        navigateToAll();
      } else if (mode === 'groups') {
        const cat = get().activeCategory;
        if (cat !== 'all') {
          const title = get().summary?.categories[cat]?.title;
          navigateToCategory(cat, title);
        } else {
          navigateToHome();
        }
      }
    } else if (typeof document !== 'undefined') {
      if (mode === 'all') {
        document.title = 'All Shapes • AssetLib';
      }
    }
    if (mode === 'all') {
      const { summary, loadedCategories, loadCategoryChunk } = get();
      if (summary) {
        Object.keys(summary.categories).forEach(catId => {
          if (!loadedCategories[catId]) {
            loadCategoryChunk(catId);
          }
        });
      }
    }
  },

  setActiveCollection: async (col, pushUrl = true) => {
    if (!col) {
      set({ activeCollection: null, viewMode: 'groups' });
      if (pushUrl) {
        const cat = get().activeCategory;
        if (cat !== 'all') {
          const title = get().summary?.categories[cat]?.title;
          navigateToCategory(cat, title);
        } else {
          navigateToHome();
        }
      } else if (typeof document !== 'undefined') {
        const cat = get().activeCategory;
        const catTitle = cat !== 'all' ? get().summary?.categories[cat]?.title : null;
        document.title = catTitle ? `${catTitle} • AssetLib` : 'AssetLib';
      }
      return;
    }

    set({
      activeCollection: col,
      activeCategory: col.category,
      viewMode: 'group_detail'
    });

    if (pushUrl) {
      navigateToGroup(col.id, col.title);
    } else if (typeof document !== 'undefined') {
      document.title = `${col.title} • AssetLib`;
    }

    await get().loadCategoryChunk(col.category);
    const { categoryCollections } = get();
    const cols = categoryCollections[col.category] || [];
    const fullCol = cols.find(c => c.id === col.id);
    if (fullCol) {
      set({ activeCollection: fullCol });
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  toggleTheme: () => set(state => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light-mode', nextTheme === 'light');
    return { theme: nextTheme };
  }),

  showToast: (msg: string) => {
    set({ toast: msg });
    setTimeout(() => {
      if (get().toast === msg) {
        set({ toast: null });
      }
    }, 2400);
  },

  openModal: (item, openStudio = false, list) => {
    const items = list && list.length > 0 ? list : [item];

    let safeIndex = items.indexOf(item);
    if (safeIndex === -1) {
      const targetFile = item.file || (item as any).primary_file;
      const targetId = item.id;
      const targetName = (item as any).name;

      safeIndex = items.findIndex(x => {
        if (x === item) return true;
        const xFile = x.file || (x as any).primary_file;
        if (targetFile && xFile && targetFile === xFile) return true;
        if (targetId && x.id && targetId === x.id) return true;
        const xName = (x as any).name;
        if (targetName && xName && targetName === xName) return true;
        return false;
      });
    }

    let finalItems = items;
    if (safeIndex === -1) {
      finalItems = [item, ...items];
      safeIndex = 0;
    }

    const targetItem = finalItems[safeIndex] || item;
    const canEdit = isOptimizedForEdits(targetItem);
    const shouldOpenStudio = canEdit ? openStudio : false;

    const desc = canEdit ? detectParametricFeatures(targetItem) : null;
    const initialParams = desc ? { ...desc.defaults } : {};
    const baseSvg = targetItem.primary_svg || (targetItem as any).svg || '';

    // Always preserve authentic SVG; only fall back to procedural generator if baseSvg is missing
    let initialSvg = baseSvg;
    if (!initialSvg && canEdit && desc && typeof desc.generate === 'function') {
      try {
        initialSvg = desc.generate(initialParams);
      } catch (e) {
        initialSvg = '';
      }
    }

    set({
      isModalOpen: true,
      modalItems: finalItems,
      currentModalIndex: safeIndex,
      isStudioOpen: shouldOpenStudio,
      studioTab: 'controls',
      currentOriginalSvg: initialSvg,
      currentWorkingSvg: applySvgTransforms(initialSvg, DEFAULT_TRANSFORMS),
      activeDescriptor: desc,
      parametricValues: initialParams,
      transformParams: { ...DEFAULT_TRANSFORMS },
      paramHistory: [initialParams],
      historyIndex: 0
    });
  },

  closeModal: () => {
    set({
      isModalOpen: false,
      isStudioOpen: false,
      modalItems: [],
      currentModalIndex: 0,
      activeDescriptor: null
    });
  },

  openDownloadModal: () => set({ isDownloadModalOpen: true }),
  closeDownloadModal: () => set({ isDownloadModalOpen: false }),

  openInfoModal: (type) => {
    set({ activeInfoModal: type });
    if (type === 'license') {
      navigateToLicense();
    } else {
      navigateToFaq();
    }
  },

  closeInfoModal: () => {
    set({ activeInfoModal: null });
    const route = getRouteFromLocation();
    if (route.type === 'license' || route.type === 'faq') {
      navigateToHome();
    }
  },

  nextModal: () => {
    const { modalItems, currentModalIndex } = get();
    if (modalItems.length <= 1) return;
    const nextIndex = (currentModalIndex + 1) % modalItems.length;
    const nextItem = modalItems[nextIndex];
    get().openModal(nextItem, get().isStudioOpen, modalItems);
  },

  prevModal: () => {
    const { modalItems, currentModalIndex } = get();
    if (modalItems.length <= 1) return;
    const prevIndex = (currentModalIndex - 1 + modalItems.length) % modalItems.length;
    const prevItem = modalItems[prevIndex];
    get().openModal(prevItem, get().isStudioOpen, modalItems);
  },

  toggleStudio: (force) => {
    const { modalItems, currentModalIndex, isStudioOpen } = get();
    const item = modalItems[currentModalIndex];
    if (!isOptimizedForEdits(item)) {
      set({ isStudioOpen: false });
      return;
    }
    const nextOpen = force !== undefined ? force : !isStudioOpen;
    set({ isStudioOpen: nextOpen });
  },

  setStudioTab: (tab) => set({ studioTab: tab }),

  setParametricValue: (key, val) => {
    const { activeDescriptor, parametricValues, transformParams, paramHistory, historyIndex } = get();
    if (!activeDescriptor) return;

    const nextValues = { ...parametricValues, [key]: val };
    let nextSvg = get().currentOriginalSvg;

    if (typeof activeDescriptor.generate === 'function') {
      try {
        nextSvg = activeDescriptor.generate(nextValues);
      } catch (err) {
        console.error('Generation error:', err);
      }
    }

    const updatedWorkingSvg = applySvgTransforms(nextSvg, transformParams);
    const newHistory = paramHistory.slice(0, historyIndex + 1);
    newHistory.push(nextValues);

    set({
      parametricValues: nextValues,
      currentOriginalSvg: nextSvg,
      currentWorkingSvg: updatedWorkingSvg,
      paramHistory: newHistory,
      historyIndex: newHistory.length - 1
    });
  },

  randomizeParameters: () => {
    const { activeDescriptor, transformParams } = get();
    if (!activeDescriptor || !activeDescriptor.optimized) {
      get().showToast('NO PARAMETRIC CONTROLS');
      return;
    }
    const randomized = activeDescriptor.randomize();
    let nextSvg = get().currentOriginalSvg;
    try {
      nextSvg = activeDescriptor.generate(randomized);
    } catch (e) {
      console.error('Randomize generation failed:', e);
    }
    const updatedWorkingSvg = applySvgTransforms(nextSvg, transformParams);

    set(state => ({
      parametricValues: randomized,
      currentOriginalSvg: nextSvg,
      currentWorkingSvg: updatedWorkingSvg,
      paramHistory: [...state.paramHistory.slice(0, state.historyIndex + 1), randomized],
      historyIndex: state.historyIndex + 1
    }));
    get().showToast('RANDOMIZED PARAMETERS');
  },

  setTransformParam: (key, val) => {
    const { transformParams, currentOriginalSvg } = get();
    const nextTransforms = { ...transformParams, [key]: val };
    const nextWorking = applySvgTransforms(currentOriginalSvg, nextTransforms);
    set({
      transformParams: nextTransforms,
      currentWorkingSvg: nextWorking
    });
  },

  setWorkingSvgCode: (code: string) => {
    set({ currentWorkingSvg: code });
  },

  resetToOriginal: () => {
    const { modalItems, currentModalIndex } = get();
    const item = modalItems[currentModalIndex];
    if (!item) return;
    get().openModal(item, get().isStudioOpen, modalItems);
    get().showToast('RESET TO ORIGINAL');
  },

  saveToLibrary: () => {
    const { modalItems, currentModalIndex, currentWorkingSvg } = get();
    const item = modalItems[currentModalIndex];
    if (!item) return;

    if ('primary_svg' in item) {
      item.primary_svg = currentWorkingSvg;
    } else {
      (item as any).svg = currentWorkingSvg;
    }
    get().showToast('SAVED TO LIBRARY');
  },

  undoParam: () => {
    const { historyIndex, paramHistory, activeDescriptor, transformParams } = get();
    if (historyIndex > 0 && activeDescriptor) {
      const prevValues = paramHistory[historyIndex - 1];
      const prevSvg = activeDescriptor.generate(prevValues);
      set({
        historyIndex: historyIndex - 1,
        parametricValues: prevValues,
        currentOriginalSvg: prevSvg,
        currentWorkingSvg: applySvgTransforms(prevSvg, transformParams)
      });
      get().showToast('UNDO');
    }
  },

  redoParam: () => {
    const { historyIndex, paramHistory, activeDescriptor, transformParams } = get();
    if (historyIndex < paramHistory.length - 1 && activeDescriptor) {
      const nextValues = paramHistory[historyIndex + 1];
      const nextSvg = activeDescriptor.generate(nextValues);
      set({
        historyIndex: historyIndex + 1,
        parametricValues: nextValues,
        currentOriginalSvg: nextSvg,
        currentWorkingSvg: applySvgTransforms(nextSvg, transformParams)
      });
      get().showToast('REDO');
    }
  },

  toggleBounds: () => set(state => ({ showBounds: !state.showBounds })),
  toggleAltBg: () => set(state => ({ altBg: !state.altBg })),
  setZoomMode: (mode) => set({ zoomMode: mode })
}));
