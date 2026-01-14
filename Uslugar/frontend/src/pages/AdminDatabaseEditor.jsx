import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminDatabaseEditor = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [tableStructure, setTableStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM "User" LIMIT 10;');
  const [queryResult, setQueryResult] = useState(null);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'query', 'structure'

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableData();
      loadTableStructure();
    }
  }, [selectedTable, page]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/database/tables');
      setTables(response.data.tables || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju tablica');
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/database/table/${selectedTable}`, {
        params: { page, limit }
      });
      setTableData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const loadTableStructure = async () => {
    try {
      const response = await api.get(`/admin/database/table/${selectedTable}/structure`);
      setTableStructure(response.data);
    } catch (err) {
      console.error('Greška pri učitavanju strukture:', err);
    }
  };

  const executeQuery = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/admin/database/query', { query: sqlQuery });
      setQueryResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri izvršavanju query-ja');
      setQueryResult(null);
    } finally {
      setLoading(false);
    }
  };

  const startEditCell = (row, column) => {
    setEditingCell({ row, column });
    setEditValue(row[column] !== null && row[column] !== undefined ? String(row[column]) : '');
  };

  const saveCell = async () => {
    if (!editingCell || !tableData) return;
    
    try {
      setLoading(true);
      const row = tableData.data[editingCell.row];
      const idColumn = Object.keys(row).find(key => key === 'id' || key.endsWith('Id')) || 'id';
      
      await api.patch(`/admin/database/table/${selectedTable}/cell`, {
        id: row[idColumn],
        idColumn,
        column: editingCell.column,
        value: editValue
      });
      
      setEditingCell(null);
      await loadTableData();
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri spremanju');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🗄️ Database Editor</h1>
        <p className="text-gray-600">Vizualni editor baze podataka - pregled, edit i SQL queries</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Lista tablica */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Tablice</h2>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {tables.map((table) => (
              <button
                key={table.table_name}
                onClick={() => {
                  setSelectedTable(table.table_name);
                  setActiveTab('browse');
                  setPage(1);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                  selectedTable === table.table_name
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {table.table_name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9 bg-white rounded-lg shadow">
          {selectedTable ? (
            <>
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex space-x-4 px-6">
                  <button
                    onClick={() => setActiveTab('browse')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === 'browse'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📊 Pregled podataka
                  </button>
                  <button
                    onClick={() => setActiveTab('structure')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === 'structure'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🏗️ Struktura
                  </button>
                  <button
                    onClick={() => setActiveTab('query')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === 'query'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🔍 SQL Query
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Browse Tab */}
                {activeTab === 'browse' && tableData && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{selectedTable}</h3>
                      <div className="text-sm text-gray-600">
                        Stranica {page} od {tableData.pagination.totalPages} 
                        ({tableData.pagination.total} redaka)
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {tableData.columns.map((col) => (
                              <th
                                key={col.column_name}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {col.column_name}
                                <div className="text-xs text-gray-400 font-normal">
                                  {col.data_type}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableData.data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              {tableData.columns.map((col) => {
                                const isEditing = editingCell?.row === rowIndex && editingCell?.column === col.column_name;
                                return (
                                  <td
                                    key={col.column_name}
                                    className="px-4 py-2 text-sm text-gray-900"
                                    onDoubleClick={() => startEditCell(row, col.column_name)}
                                  >
                                    {isEditing ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="flex-1 px-2 py-1 border rounded"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveCell();
                                            if (e.key === 'Escape') cancelEdit();
                                          }}
                                        />
                                        <button
                                          onClick={saveCell}
                                          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                                        >
                                          💾
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="cursor-pointer" title="Double-click to edit">
                                        {row[col.column_name] !== null && row[col.column_name] !== undefined
                                          ? String(row[col.column_name])
                                          : <span className="text-gray-400">NULL</span>}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                      >
                        ← Prethodna
                      </button>
                      <span className="text-sm text-gray-600">
                        Stranica {page} od {tableData.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(tableData.pagination.totalPages, p + 1))}
                        disabled={page >= tableData.pagination.totalPages}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                      >
                        Sljedeća →
                      </button>
                    </div>
                  </div>
                )}

                {/* Structure Tab */}
                {activeTab === 'structure' && tableStructure && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{selectedTable} - Struktura</h3>
                    
                    {/* Kolone */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-2">Kolone</h4>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Naziv</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tip</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nullable</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Default</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableStructure.columns.map((col) => (
                            <tr key={col.column_name}>
                              <td className="px-4 py-2 text-sm">{col.column_name}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {col.data_type}
                                {col.character_maximum_length && `(${col.character_maximum_length})`}
                                {col.numeric_precision && `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`}
                              </td>
                              <td className="px-4 py-2 text-sm">{col.is_nullable === 'YES' ? '✓' : '✗'}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{col.column_default || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Indeksi */}
                    {tableStructure.indexes && tableStructure.indexes.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium mb-2">Indeksi</h4>
                        <div className="space-y-2">
                          {tableStructure.indexes.map((idx, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded text-sm font-mono">
                              {idx.indexname}: {idx.indexdef}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Foreign Keys */}
                    {tableStructure.foreignKeys && tableStructure.foreignKeys.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium mb-2">Foreign Keys</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Kolona</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Referencira</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {tableStructure.foreignKeys.map((fk, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2 text-sm">{fk.column_name}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {fk.foreign_table_name}.{fk.foreign_column_name}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Query Tab */}
                {activeTab === 'query' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">SQL Query Editor</h3>
                    <div className="mb-4">
                      <textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="w-full h-32 p-3 border rounded font-mono text-sm"
                        placeholder="SELECT * FROM &quot;User&quot; LIMIT 10;"
                      />
                    </div>
                    <button
                      onClick={executeQuery}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Izvršavam...' : '▶ Izvrši Query'}
                    </button>

                    {queryResult && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium mb-2">
                          Rezultati ({queryResult.rowCount} redaka)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {queryResult.result.length > 0 &&
                                  Object.keys(queryResult.result[0]).map((key) => (
                                    <th
                                      key={key}
                                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                    >
                                      {key}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {queryResult.result.map((row, i) => (
                                <tr key={i}>
                                  {Object.values(row).map((val, j) => (
                                    <td key={j} className="px-4 py-2 text-sm">
                                      {val !== null && val !== undefined ? String(val) : <span className="text-gray-400">NULL</span>}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Odaberite tablicu za pregled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDatabaseEditor;

