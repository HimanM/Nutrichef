import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { authenticatedFetch } from '../../utils/apiUtil.js'; // Real one
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminErrorDisplay, AdminFullPageError } from '../../components/common/ErrorDisplay.jsx';

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
      <AdminFullPageError 
        error={error}
        title="Classification Scores"
        onRetry={() => fetchScores(page, rowsPerPage)}
      />
    );
  }

  return (
    <div className="section-padding">
      <div className="container-modern">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Classification Scores</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">Review and analyze ingredient classification accuracy and scores.</p>
        </div>
        {error && scoresSummary.length > 0 && (
          <div className="mb-4">
            <AdminErrorDisplay 
              error={error}
              type="warning"
            />
          </div>
        )}
        {scoresSummary.length > 0 && !loading && (
          <div className="card-glass shadow-lg rounded-3xl p-4 sm:p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Scores Distribution (Latest {chartData.length} on current page)</h2>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="name" style={{ fontSize: '0.8rem' }} stroke="#9CA3AF" />
                  <YAxis domain={[0, 1]} style={{ fontSize: '0.8rem' }} stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#374151', border: '1px solid #4B5563', borderRadius: '0.375rem' }}
                    itemStyle={{ color: '#E5E7EB' }}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.9rem', color: '#374151' }} />
                  <Bar dataKey="score" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {scoresSummary.length === 0 && !loading && !error && (
          <p className="text-center text-gray-400 mt-6 text-lg">No classification scores found.</p>
        )}
        {scoresSummary.length > 0 && (
          <div className="card-glass shadow-lg rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Result ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Predicted Food Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading && (
                    <tr><td colSpan={4} className="text-center py-4"><TableSpinner /></td></tr>
                  )}
                  {!loading && scoresSummary.map((item) => (
                    <tr key={item.result_id} className="hover:bg-emerald-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.result_id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.predicted_food_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.score !== null ? item.score.toFixed(4) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalCount > 0 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-white rounded-b-3xl">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`btn-primary ${commonButtonClassNameBase}`}>Previous</button>
                  <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= totalCount} className={`btn-primary ${commonButtonClassNameBase}`}>Next</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min((page + 1) * rowsPerPage, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="rowsPerPageSelect" className="text-xs text-gray-500">Rows per page:</label>
                    <select id="rowsPerPageSelect" value={rowsPerPage} onChange={handleChangeRowsPerPage} className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-xs">
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button onClick={() => handleChangePage(page - 1)} disabled={page === 0} className={`${commonButtonClassNameBase} bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 rounded-l-md border`}>Prev</button>
                      <button onClick={() => handleChangePage(page + 1)} disabled={(page + 1) * rowsPerPage >= totalCount} className={`${commonButtonClassNameBase} bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 rounded-r-md border`}>Next</button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassificationScoresPage;
