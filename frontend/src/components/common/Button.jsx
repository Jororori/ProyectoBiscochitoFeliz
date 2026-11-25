export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const estilos = {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    secondary: 'bg-stone-200 hover:bg-stone-300 text-stone-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  };
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium text-sm transition cursor-pointer disabled:opacity-50 ${estilos[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
