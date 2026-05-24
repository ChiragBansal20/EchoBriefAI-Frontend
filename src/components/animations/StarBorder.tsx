import "./StarBorder.css";
import { ElementType, ReactNode } from "react";

interface Props {
  as?: ElementType;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  children: ReactNode;
  [key: string]: any;
}

export const StarBorder = ({
  as: Component = "div",
  className = "",
  color = "hsl(var(--primary))",
  speed = "6s",
  thickness = 1,
  children,
  ...rest
}: Props) => {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{ padding: `${thickness}px 0`, ...rest.style }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
      />
      <div
        className="border-gradient-top"
        style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
      />
      <div className="star-inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;
