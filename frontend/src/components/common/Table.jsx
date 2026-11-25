export default function Table({ columns, data, emptyMessage = 'No hay registros disponibles.' }) {
  return (
    <div className="overflow-x-auto border border-stone-200 rounded-lg">
      <table className="min-w-full divide-y divide-stone-200 text-sm">
        <thead className="bg-stone-50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-stone-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr key={row.id || rIdx} className="hover:bg-amber-50/40">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-stone-700 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
