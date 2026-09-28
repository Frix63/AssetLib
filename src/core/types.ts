export interface AssetItem {
  id?: string;
  name?: string;
  file: string;
  png_file?: string;
  title: string;
  category: string;
  category_label?: string;
  collection_id?: string;
  collection_title?: string;
  tags?: string[];
  svg?: string;
  primary_svg?: string;
  primary_file?: string;
}

export interface CollectionItem {
  id: string;
  name?: string;
  file?: string;
  title: string;
  category: string;
  category_label: string;
  count: number;
  description: string;
  tags: string[];
  primary_svg: string;
  primary_file: string;
  svg?: string;
  collection_id?: string;
  collection_title?: string;
}

export interface CategoryInfo {
  title: string;
  count: number;
}

export interface ManifestSummary {
  total_shapes: number;
  total_collections: number;
  categories: Record<string, CategoryInfo>;
  collections: CollectionItem[];
}

export type ControlType = 'range' | 'toggle' | 'stepper' | 'select';

export interface ParamControl {
  key: string;
  label: string;
  type: ControlType;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string | number; label: string }[];
}

export interface ParametricDescriptor {
  optimized: boolean;
  type: string;
  label: string;
  controls: ParamControl[];
  defaults: Record<string, number | boolean | string>;
  randomize: (seed?: number) => Record<string, number | boolean | string>;
  generate: (params: Record<string, any>) => string;
}

export interface StudioTransformParams {
  scale: number;
  stretchX: number;
  stretchY: number;
  strokeWidth: number;
  cornerJoin: 'miter' | 'round' | 'bevel' | 'orig';
  dashPattern: 'solid' | 'dashed' | 'dotted';
  rotation: number;
  panX: number;
  panY: number;
  invertFill: boolean;
  flipH: boolean;
  flipV: boolean;
}
