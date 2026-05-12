export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-display tracking-wide uppercase transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-blood text-white border-2 border-ink shadow-hard hover:bg-red-700 active:shadow-none active:translate-y-1 active:translate-x-1',
    secondary:
      'bg-chalk text-ink border-2 border-ink shadow-hard hover:bg-gray-100 active:shadow-none active:translate-y-1 active:translate-x-1',
    ghost:
      'bg-transparent text-ink hover:bg-black/5 font-sans font-semibold tracking-normal normal-case',
    icon: 'bg-chalk text-ink border-2 border-ink shadow-hard-sm active:shadow-none active:translate-y-[2px] active:translate-x-[2px] rounded-full p-2'
  };
  const sizes = {
    sm: 'h-10 px-4 text-lg',
    md: 'h-12 px-6 text-xl',
    lg: 'h-14 px-8 text-2xl'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${variant !== 'icon' ? sizes[size] : ''} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
