export default function Input({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-stone-700 mb-1">{label}</label>}
      <input
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        {...props}
      />
    </div>
  );
}
