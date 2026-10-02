import React from 'react';

interface Props {
  progress: number;
}

export const RainbowProgressBar: React.FC<Props> = ({ progress }) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full text-center">
      <div className="w-full h-5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, #FF0000 0%, #FF7F00 16%, #FFFF00 33%, #00FF00 50%, #00FFFF 66%, #0000FF 83%, #8B00FF 100%)'
          }}
        />
      </div>
      <div className="mt-1 text-sm font-bold text-slate-700">{clamped}%</div>
    </div>
  );
};
