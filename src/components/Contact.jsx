import React, { useState } from 'react';
import Papa from 'papaparse';
import Plot from 'react-plotly.js';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawData, setRawData] = useState([]); // Store the raw data separately
  const [processedData, setProcessedData] = useState([]); // Store the classified data
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [viewRawData, setViewRawData] = useState(true);  // Toggle for raw/classified data
  const [selectedModel, setSelectedModel] = useState(''); // Track selected ML model
  const [fileList, setFileList] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [viewedFiles, setViewedFiles] = useState([]);

  // Handle file selection and add it to the list
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMessage('No file selected');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setMessage('Invalid file format. Please upload a CSV file.');
      return;
    }

    const uploadTime = new Date();
    setFileList([...fileList, { file, uploadTime }]);
    setMessage('');
  };

  // Handle file view toggle
  const handleViewData = (fileName) => {
    if (viewedFiles.includes(fileName)) {
      setViewedFiles(viewedFiles.filter((name) => name !== fileName));
    } else {
      setViewedFiles([...viewedFiles, fileName]);
    }
  };

  // Handle file deletion
  const handleDeleteData = (fileName) => {
    setFileList(fileList.filter((fileEntry) => fileEntry.file.name !== fileName));
    setViewedFiles(viewedFiles.filter((name) => name !== fileName));
    setSelectedFileName(null); // Reset the selected file when deleted
    setRawData([]); // Clear displayed raw data
    setProcessedData([]); // Clear processed data
  };

  // Parse CSV and show raw graph when file is clicked
  const handleFileClick = (file) => {
    setSelectedFileName(file.file.name);
    setIsLoading(true);

    Papa.parse(file.file, {
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        const parsedData = result.data
          .map((row) => {
            if (!row.timestamp || !row.x || !row.y || !row.z) {
              setMessage('Invalid data structure. Make sure the CSV contains timestamp, x, y, z columns.');
              setIsLoading(false);
              return null;
            }

            return {
              timestamp: new Date(row.timestamp), // Adjust timestamp parsing if necessary
              x: parseFloat(row.x),
              y: parseFloat(row.y),
              z: parseFloat(row.z),
            };
          })
          .filter(Boolean);

        if (parsedData.length === 0) {
          setMessage('No valid data found in the file.');
          setIsLoading(false);
          return;
        }

        setRawData(parsedData); // Set raw data for visualization
        setProcessedData([]);  // Clear processed data on new file selection
        setIsLoading(false);
      },
      error: (error) => {
        setMessage(`Error parsing file: ${error.message}`);
        setIsLoading(false);
      },
    });
  };

  // Handle ML Model selection and process data
  const handleProcessData = () => {
    if (!selectedModel) {
      setMessage('Please select a machine learning model.');
      return;
    }

    // Mock processing with the selected ML model
    const processed = rawData.map((point) => ({
      ...point,
      activity: point.x > 0.5 ? 'Walking' : 'Stationary', // Example classification logic
    }));

    setProcessedData(processed);
    setViewRawData(false); // Switch to classified data view after processing
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl mt-8 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Accelerometer Data Visualization</h1>

      {/* File Upload */}
      <div className="mb-4">
        <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full p-2 border rounded-md" />
      </div>

      {/* List of Uploaded Files */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
        {fileList.length > 0 ? (
          <table className="min-w-full table-auto bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border">File Name</th>
                <th className="px-4 py-2 border">Upload Date</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {fileList.map((fileEntry, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">{fileEntry.file.name}</td>
                  <td className="px-4 py-2 border">{fileEntry.uploadTime.toLocaleString()}</td>
                  <td className="px-4 py-2 border">
                    <button
                      className="text-blue-600"
                      onClick={() => {
                        handleFileClick(fileEntry);
                        handleViewData(fileEntry.file.name);
                      }}
                    >
                      {viewedFiles.includes(fileEntry.file.name) ? 'Hide Data' : 'View Data'}
                    </button>
                    <button
                      className="ml-2 text-red-600"
                      onClick={() => handleDeleteData(fileEntry.file.name)}
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
      <div className="flex flex-row mb-4 items-center">
        <label className="mr-2 font-bold">Select ML Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="" disabled>Select a model</option>
          <option value="linear-regression">Linear Regression</option>
        </select>
        <button
          onClick={handleProcessData}
          className="ml-2 p-2 bg-blue-500 text-white rounded-md"
        >
          Process
        </button>
      </div>

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
