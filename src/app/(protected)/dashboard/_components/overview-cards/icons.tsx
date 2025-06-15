import type { SVGProps } from "react";

type SVGPropsType = SVGProps<SVGSVGElement>;

export function Institution(props: SVGPropsType) {
  return (
    <svg width={58} height={58} viewBox="0 0 58 58" fill="none" {...props}>
      <circle cx={29} cy={29} r={29} fill="#3FD97F" />
      <rect x={16} y={28} width={26} height={14} rx={2} fill="#fff" />
      <rect x={22} y={34} width={4} height={8} rx={1} fill="#3FD97F" />
      <rect x={32} y={34} width={4} height={8} rx={1} fill="#3FD97F" />
      <rect x={27} y={34} width={4} height={8} rx={1} fill="#3FD97F" />
      <polygon points="29,16 14,28 44,28" fill="#fff" />
      <rect x={26} y={38} width={6} height={4} rx={1} fill="#fff" />
    </svg>
  );
}


export function Audit(props: SVGPropsType) {
  return (
    <svg width={58} height={58} viewBox="0 0 58 58" fill="none" {...props}>
      <circle cx={29} cy={29} r={29} fill="#FFB347" />
      <rect x={18} y={18} width={22} height={22} rx={4} fill="#fff" />
      <rect x={22} y={24} width={14} height={2} rx={1} fill="#FFB347" />
      <rect x={22} y={29} width={10} height={2} rx={1} fill="#FFB347" />
      <circle cx={36} cy={36} r={3} fill="#FFB347" />
    </svg>
  );
}

export function Document(props: SVGPropsType) {
  return (
    <svg width={58} height={58} viewBox="0 0 58 58" fill="none" {...props}>
      <circle cx={29} cy={29} r={29} fill="#6EC1E4" />
      <rect x={18} y={18} width={22} height={22} rx={4} fill="#fff" />
      <rect x={22} y={24} width={14} height={2} rx={1} fill="#6EC1E4" />
      <rect x={22} y={29} width={10} height={2} rx={1} fill="#6EC1E4" />
      <rect x={22} y={34} width={8} height={2} rx={1} fill="#6EC1E4" />
    </svg>
  );
}

export function Risk(props: SVGPropsType) {
  return (
    <svg width={58} height={58} viewBox="0 0 58 58" fill="none" {...props}>
      <circle cx={29} cy={29} r={29} fill="#FF6B6B" />
      <polygon points="29,16 44,42 14,42" fill="#fff" />
      <rect x={27} y={28} width={4} height={8} rx={2} fill="#FF6B6B" />
      <circle cx={29} cy={38} r={2} fill="#FF6B6B" />
    </svg>
  );
}

export function Student(props: SVGPropsType) {
  return (
    <svg width={58} height={58} viewBox="0 0 58 58" fill="none" {...props}>
      <circle cx={29} cy={29} r={29} fill="#7ED957" />
      <ellipse cx={29} cy={28} rx={8} ry={8} fill="#fff" />
      <ellipse cx={29} cy={38} rx={12} ry={5} fill="#fff" />
      <rect x={25} y={24} width={8} height={2} rx={1} fill="#7ED957" />
    </svg>
  );
}
// New Clients icon: two people with a "plus" sign
export function NewClients(props: SVGPropsType) {
  return (
    <svg width={58} height={58} viewBox="0 0 58 58" fill="none" {...props}>
      <circle cx={29} cy={29} r={29} fill="#FF9C55" />
      {/* Main user */}
      <ellipse cx={24} cy={27} rx={5} ry={5} fill="#fff" />
      <ellipse cx={24} cy={37} rx={8} ry={4} fill="#fff" />
      {/* Secondary user (behind) */}
      <ellipse cx={36} cy={29} rx={4} ry={4} fill="#fff" fillOpacity={0.7} />
      <ellipse cx={36} cy={36} rx={6} ry={3} fill="#fff" fillOpacity={0.7} />
      {/* Plus sign */}
      <rect x={41} y={19} width={8} height={2} rx={1} fill="#fff" />
      <rect x={44} y={16} width={2} height={8} rx={1} fill="#fff" />
    </svg>
  );
}

export function Product(props: SVGPropsType) {
  return (
    <svg width={58} height={58} viewBox="0 0 58 58" fill="none" {...props}>
      <circle cx={29} cy={29} r={29} fill="#8155FF" />
      <path
        d="M35.043 20.8l-2.167-1.136c-1.902-.998-2.853-1.498-3.876-1.498-1.023 0-1.974.5-3.876 1.498L22.958 20.8c-1.922 1.008-3.051 1.6-3.752 2.394L29 28.09l9.794-4.896c-.7-.793-1.83-1.386-3.751-2.394zM39.56 24.628l-9.747 4.874v10.227c.777-.194 1.662-.658 3.063-1.393l2.167-1.137c2.33-1.223 3.496-1.835 4.143-2.934.647-1.099.647-2.467.647-5.202v-.127c0-2.05 0-3.332-.272-4.308zM28.188 39.73V29.501l-9.749-4.874c-.272.976-.272 2.258-.272 4.308v.127c0 2.735 0 4.103.647 5.202.647 1.1 1.813 1.71 4.144 2.934l2.166 1.137c1.4.735 2.286 1.2 3.064 1.393z"
        fill="#fff"
      />
    </svg>
  );
}

export function Users(props: SVGPropsType) {
  return (
    <svg width={58} height={58} viewBox="0 0 58 58" fill="none" {...props}>
      <circle cx={29} cy={29} r={29} fill="#18BFFF" />
      <ellipse
        cx={25.7511}
        cy={22.4998}
        rx={4.33333}
        ry={4.33333}
        fill="#fff"
      />
      <ellipse
        cx={25.7511}
        cy={34.4178}
        rx={7.58333}
        ry={4.33333}
        fill="#fff"
      />
      <path
        d="M38.75 34.417c0 1.795-2.206 3.25-4.898 3.25.793-.867 1.339-1.955 1.339-3.248 0-1.295-.547-2.384-1.342-3.252 2.693 0 4.9 1.455 4.9 3.25zM35.5 22.501a3.25 3.25 0 01-4.364 3.054 6.163 6.163 0 00.805-3.055c0-1.11-.293-2.152-.804-3.053A3.25 3.25 0 0135.5 22.5z"
        fill="#fff"
      />
    </svg>
  );
}
