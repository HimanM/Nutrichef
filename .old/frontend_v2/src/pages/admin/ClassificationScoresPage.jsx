import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js'; // Real one
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Spinner component
const PageLoaderSpinner = () => <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>; {/* text-indigo-400 */}
const TableSpinner = () => <svg className="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>; {/* text-indigo-400 */}


function ClassificationScoresPage() {
  const authContextValue = useAuth();
  const [scoresSummary, setScoresSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); // 0-indexed for our custom pagination logic matching MUI's current state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchScores = useCallback(async (currentPage, currentRowsPerPage) => {
    setLoading(true); setError(null);
    try {
      const backendPage = currentPage + 1; // API is 1-indexed
      const response = await authenticatedFetch(
        `/api/admin/classification_scores_summary?page=${backendPage}&per_page=${currentRowsPerPage}`,
        { method: 'GET' },
        authContextValue
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch scores: ${response.status}`);
      }
      const data = await response.json();
      setScoresSummary(data.scores_summary || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err.message); console.error("Error fetching scores:", err);
      setScoresSummary([]); setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [authContextValue]); // Removed page, rowsPerPage from here, will pass them directly

  useEffect(() => {
    fetchScores(page, rowsPerPage);
  }, [page, rowsPerPage, fetchScores]);

  const handleChangePage = (newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const chartData = scoresSummary.slice(0, 20).map(item => ({
    name: item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A',
    score: item.score !== null ? parseFloat(item.score.toFixed(4)) : 0,
  })).reverse();

  const commonButtonClassNameBase = "px-3 py-1.5 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"; // Renamed for clarity

  if (loading && scoresSummary.length === 0) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /></div>;
  }
  if (error && scoresSummary.length === 0) {
    return (
      <div className="page-container my-8"> {/* page-container */}
        <div className="p-4 bg-red-700/[0.5] border-l-4 border-red-500 text-red-200 rounded-md"> {/* Dark theme error */}
          <p>Error fetching classification scores: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container my-8"> {/* Applied page-container */}
      <h1 className="text-2xl sm:text-3xl mb-6"> {/* Uses global h1 style */}
        Classification Scores Summary
      </h1>

      {error && scoresSummary.length > 0 && (
         <div className="mb-4 p-3 bg-red-700/[0.5] border border-red-500 text-red-200 rounded-md text-sm"> {/* Dark theme error */}
            {error}
        </div>
      )}

      {scoresSummary.length > 0 && !loading && (
        <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mb-8"> {/* bg-gray-800 */}
          <h2 className="text-xl font-semibold mb-4"> {/* Uses global h2 style */}
            Scores Distribution (Latest {chartData.length} on current page)
          </h2>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" /> {/* stroke gray-600 */}
                <XAxis dataKey="name" style={{ fontSize: '0.8rem' }} stroke="#9CA3AF" /> {/* stroke gray-400 */}
                <YAxis domain={[0, 1]} style={{ fontSize: '0.8rem' }} stroke="#9CA3AF" /> {/* stroke gray-400 */}
                <Tooltip
                  contentStyle={{ backgroundColor: '#374151', border: '1px solid #4B5563', borderRadius: '0.375rem' }} // bg-gray-700, border-gray-600
                  itemStyle={{ color: '#E5E7EB' }} // text-gray-200
                  labelStyle={{ color: '#D1D5DB' }} // text-gray-300
                />
                <Legend wrapperStyle={{ fontSize: '0.9rem', color: '#D1D5DB' }} /> {/* text-gray-300 */}
                <Bar dataKey="score" fill="#60A5FA" /> {/* fill blue-400 */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {scoresSummary.length === 0 && !loading && !error && (
        <p className="text-center text-gray-400 mt-6 text-lg"> {/* text-gray-400 */}
          No classification scores found.
        </p>
      )}

      {scoresSummary.length > 0 && (
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden"> {/* bg-gray-800 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700"> {/* divide-gray-700 */}
              <thead className="bg-gray-700"> {/* bg-gray-700 */}
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Result ID</th> {/* text-gray-400 */}
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Predicted Food Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700"> {/* bg-gray-800, divide-gray-700 */}
                {loading && (
                  <tr><td colSpan={4} className="text-center py-4"><TableSpinner /></td></tr>
                )}
                {!loading && scoresSummary.map((item) => (
                  <tr key={item.result_id} className="hover:bg-gray-700"> {/* hover:bg-gray-700 */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.result_id}</td> {/* text-gray-300 */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.predicted_food_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.score !== null ? item.score.toFixed(4) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalCount > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6 bg-gray-800 rounded-b-lg"> {/* border-gray-700, bg-gray-800 */}
              <div className="flex-1 flex justify-between sm:hidden">
                <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`gradient-button ${commonButtonClassNameBase}`}>Previous</button> {/* Gradient button */}
                <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= totalCount} className={`gradient-button ${commonButtonClassNameBase}`}>Next</button> {/* Gradient button */}
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-300"> {/* text-gray-300 */}
                    Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min((page + 1) * rowsPerPage, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="rowsPerPageSelect" className="text-xs text-gray-300">Rows per page:</label> {/* text-gray-300 */}
                  <select id="rowsPerPageSelect" value={rowsPerPage} onChange={handleChangeRowsPerPage} className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"> {/* Dark theme select */}
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`${commonButtonClassNameBase} bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600 rounded-l-md border`}>Prev</button> {/* Dark theme secondary button */}
                    <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= totalCount} className={`${commonButtonClassNameBase} bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600 rounded-r-md border`}>Next</button> {/* Dark theme secondary button */}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClassificationScoresPage;
