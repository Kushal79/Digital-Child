import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Plot from 'react-plotly.js';
import axios from 'axios';  // Use axios to handle HTTP requests

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [viewRawData, setViewRawData] = useState(true);
  const [selectedModel, setSelectedModel] = useState('');
  const [fileList, setFileList] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [viewedFiles, setViewedFiles] = useState([]);

  // Fetch uploaded files from the server when the component mounts
  useEffect(() => {
    fetchFilesFromServer();
  }, []);

  // Fetch uploaded files from the backend
  const fetchFilesFromServer = async () => {
    try {
      const response = await axios.get('/api/Dataset');  // Adjust API endpoint if needed
      setFileList(response.data);
    } catch (error) {
      setMessage('Failed to fetch files from server');
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.zip'))) {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Please select a valid CSV or ZIP file');
    }
  };

  // Handle file upload to the backend
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setIsLoading(true);
      const response = await axios.post('/api/Dataset/Post', formData);  // API call to the backend
      setMessage('File uploaded successfully');
      setSelectedFile(null);
      fetchFilesFromServer();  // Refresh file list after upload
    } catch (error) {
      setMessage(error.response?.data || 'File upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file view and fetch data from the server
  const handleViewData = (fileName) => {
    if (viewedFiles.includes(fileName)) {
      setViewedFiles(viewedFiles.filter((name) => name !== fileName));
    } else {
      setViewedFiles([...viewedFiles, fileName]);
      fetchFileData(fileName);  // Fetch file data from backend
    }
  };

  // Fetch file data from backend and parse CSV
  const fetchFileData = async (fileId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/Dataset/Get/${fileId}`);  // Adjust API endpoint
      const fileData = response.data;

      // Parse CSV file
      Papa.parse(fileData, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const parsedData = result.data
            .map((row) => ({
              timestamp: new Date(row.timestamp),
              x: parseFloat(row.x),
              y: parseFloat(row.y),
              z: parseFloat(row.z),
            }))
            .filter(Boolean);

          setRawData(parsedData);
          setProcessedData([]);  // Clear processed data on new file selection
          setSelectedFileName(fileId);
        },
        error: (error) => setMessage(`Error parsing file: ${error.message}`),
      });
    } catch (error) {
      setMessage('Failed to fetch file data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file deletion from the backend
  const handleDeleteData = async (fileId) => {
    try {
      await axios.delete(`/api/Dataset/Delete/${fileId}`);  // Adjust API endpoint
      setMessage('File deleted successfully');
      fetchFilesFromServer();  // Refresh file list after deletion
    } catch (error) {
      setMessage('Failed to delete file');
    }
  };

  // Handle ML Model selection and process data
  const handleProcessData = async () => {
    if (!selectedModel || !selectedFileName) {
      setMessage('Please select a file and machine learning model');
      return;
    }

    try {
      const response = await axios.post(`/api/process`, {
        model: selectedModel,
        fileName: selectedFileName,
      });

      const processed = response.data;
      setProcessedData(processed);
      setViewRawData(false);  // Toggle to classified data view after processing
    } catch (error) {
      setMessage('Failed to process data');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl mt-8 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Accelerometer Data Visualization</h1>

      {/* File Upload */}
      <div className="mb-4">
        <input type="file" accept=".csv, .zip" onChange={handleFileChange} className="block w-full p-2 border rounded-md" />
        {selectedFile && (
          <button
            onClick={handleFileUpload}
            className="mt-2 p-2 bg-blue-500 text-white rounded-md"
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>

      {/* List of Uploaded Files */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
        {fileList.length > 0 ? (
          <table className="min-w-full table-auto bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border">File Name</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {fileList.map((fileEntry, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">{fileEntry.fileName}</td>
                  <td className="px-4 py-2 border">
                    <button
                      className="text-blue-600"
                      onClick={() => handleViewData(fileEntry.datasetId)}
                    >
                      {viewedFiles.includes(fileEntry.datasetId) ? 'Hide Data' : 'View Data'}
                    </button>
                    <button
                      className="ml-2 text-red-600"
                      onClick={() => handleDeleteData(fileEntry.datasetId)}
                    >
                      Delete Data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No files uploaded yet.</p>
        )}
      </div>

      {/* Model Selection beside the graph */}
      {selectedFileName && (
        <div className="flex flex-row mb-4 items-center">
          <label className="mr-2 font-bold">Select ML Model:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="" disabled>Select a model</option>
            <option value="linear-regression">Linear Regression</option>
            <option value="decision-tree">Decision Tree</option>
            {/* Add more models as needed */}
          </select>
          <button
            onClick={handleProcessData}
            className="ml-2 p-2 bg-blue-500 text-white rounded-md"
            disabled={!selectedModel}
          >
            Process
          </button>
        </div>
      )}

      {/* Toggle between raw and classified data */}
      {processedData.length > 0 && (
        <div className="flex flex-row mb-4 items-center">
          <label className="mr-2 font-bold">View:</label>
          <button
            onClick={() => setViewRawData(!viewRawData)}
            className={`p-2 ${viewRawData ? 'bg-green-500' : 'bg-gray-500'} text-white rounded-md`}
          >
            {viewRawData ? 'Raw Data' : 'Classified Data'}
          </button>
        </div>
      )}

      {/* Plotly Visualization */}
      {viewedFiles.includes(selectedFileName) && (
        <>
          {rawData.length > 0 && (
            <div className="mt-6">
              <Plot
                data={[
                  {
                    x: rawData.map((point) => point.timestamp),
                    y: rawData.map((point) => point.x),
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'red' },
                    name: 'X Axis',
                  },
                  {
                    x: rawData.map((point) => point.timestamp),
                    y: rawData.map((point) => point.y),
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'green' },
                    name: 'Y Axis',
                  },
                  {
                    x: rawData.map((point) => point.timestamp),
                    y: rawData.map((point) => point.z),
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'blue' },
                    name: 'Z Axis',
                  },
                  !viewRawData && processedData.length > 0 && {
                    x: processedData.map((point) => point.timestamp),
                    y: processedData.map((point) => point.activity === 'Walking' ? 1 : 0),
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'purple' },
                    name: 'Processed Activity',
                    yaxis: 'y2',
                  },
                ].filter(Boolean)}
                layout={{
                  title: viewRawData ? 'Raw Accelerometer Data' : 'Classified Activities',
                  xaxis: { title: 'Time' },
                  yaxis: { title: viewRawData ? 'Acceleration (g)' : 'Activity' },
                  yaxis2: { overlaying: 'y', side: 'right', title: 'Activity Classification' },
                  width: 800,
                  height: 400,
                }}
                config={{
                  displayModeBar: false,
                  displaylogo: false,
                }}
              />
            </div>
          )}

          {/* Show First Five Rows of Data */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">First Five Rows of Data</h3>
            <table className="min-w-full table-auto bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Timestamp</th>
                  <th className="px-4 py-2 border">X</th>
                  <th className="px-4 py-2 border">Y</th>
                  <th className="px-4 py-2 border">Z</th>
                  {!viewRawData && <th className="px-4 py-2 border">Activity</th>}
                </tr>
              </thead>
              <tbody>
                {viewRawData
                  ? rawData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border">{row.timestamp.toLocaleString()}</td>
                        <td className="px-4 py-2 border">{row.x}</td>
                        <td className="px-4 py-2 border">{row.y}</td>
                        <td className="px-4 py-2 border">{row.z}</td>
                      </tr>
                    ))
                  : processedData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border">{row.timestamp.toLocaleString()}</td>
                        <td className="px-4 py-2 border">{row.x}</td>
                        <td className="px-4 py-2 border">{row.y}</td>
                        <td className="px-4 py-2 border">{row.z}</td>
                        <td className="px-4 py-2 border">{row.activity}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
