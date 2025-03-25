import { SkPath } from "@shopify/react-native-skia";

export type Stroke = {
  path: SkPath;
  color: string;
  strokeWidth: number;
};
