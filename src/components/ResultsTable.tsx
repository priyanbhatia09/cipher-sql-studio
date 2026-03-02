import React from 'react';

interface ResultsTableProps {
  results: any[];
  error: string | null;
}

export default function ResultsTable({ results, error }: ResultsTableProps) {
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
        Error: {error}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm italic">
        No results to display. Run a query to see data.
      </div>
    );
  }

  const headers = Object.keys(results[0]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              {headers.map((header) => (
                <td
                  key={`${idx}-${header}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono"
                >
                  {row[header] !== null ? String(row[header]) : <span className="text-gray-400 italic">NULL</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
