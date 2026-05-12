import React from 'react';
export function HPFCBadge({ className = 'w-12 h-12' }: {className?: string;}) {
  return (
    <img
      src="/HPFC_high_res_badge_black_star.png"
      alt="Hinksey Park Football Club badge"
      className={`${className} object-contain`} />);


}