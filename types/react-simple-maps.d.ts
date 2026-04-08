declare module "react-simple-maps" {
  import { ReactNode, SVGProps } from "react";

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    style?: React.CSSProperties;
    children?: ReactNode;
  }
  export function ComposableMap(props: ComposableMapProps): JSX.Element;

  interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    onMoveEnd?: (data: { zoom: number; coordinates: [number, number] }) => void;
    children?: ReactNode;
  }
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;

  interface GeographiesProps {
    geography: string | object;
    children: (data: { geographies: Geography[] }) => ReactNode;
  }
  export function Geographies(props: GeographiesProps): JSX.Element;

  interface Geography {
    rsmKey: string;
    id: string | number;
    properties: Record<string, unknown>;
  }

  interface GeographyStyleState {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    outline?: string;
    cursor?: string;
  }

  interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: Geography;
    style?: {
      default?: GeographyStyleState;
      hover?: GeographyStyleState;
      pressed?: GeographyStyleState;
    };
    onClick?: () => void;
  }
  export function Geography(props: GeographyProps): JSX.Element;
}
