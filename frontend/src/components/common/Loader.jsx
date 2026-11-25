export default function Loader({ texto = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center py-10 text-stone-500 gap-3">
      <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{texto}</span>
    </div>
  );
}
