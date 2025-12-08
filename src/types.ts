export type ExportType = 'image' | 'html';
export type InputType = 'spec' | 'html';

export type ChartOption = {
  width?: string;
  height?: string;
};

export type IBody = {
  spec: any;
  type?: ExportType;
  option?: ChartOption;
};

export type ExportResult = {
  imageUrl?: string;
  htmlUrl?: string;
};