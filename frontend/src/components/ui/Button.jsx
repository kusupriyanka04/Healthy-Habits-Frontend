import { cn } from '../../lib/utils.jsx';

const variants = {
  primary: 'btn-primary',
  ghost:   'btn-ghost',
  danger:  'inline-flex items-center justify-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-red-500/20 active:scale-95 disabled:opacity-50',
};

const sizes = {
  sm: 'text-xs px-3 py-2 rounded-lg',
  md: '',
  lg: 'text-base px-6 py-3',
};

const Button = ({
  variant   = 'primary',
  size      = 'md',
  className,
  children,
  loading,
  ...props
}) => {
  return (
    <button
      className={cn(variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}>
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
          <span style={{ fontFamily: 'var(--font-body)' }}>Loading...</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;