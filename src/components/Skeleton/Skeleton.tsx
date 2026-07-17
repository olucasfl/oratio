import type { CSSProperties } from "react";

interface Props {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
  style?: CSSProperties;
}

export default function Skeleton({
  width,
  height,
  radius = 8,
  circle = false,
  style,
}: Props) {

  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: circle ? "50%" : radius,
        flexShrink: circle ? 0 : undefined,
        ...style,
      }}
    />
  );

}
