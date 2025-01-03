import React, { useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import Result from './Result';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const processSteps = [
    { id: 'upload', title: 'Uploading File' },
    { id: 'analyze', title: 'Analyzing Report' },
    { id: 'summarize', title: 'Generating Summary' },
  ];

  const handleFile = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCurrentStep(null);
      setSummary(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("No file selected for upload.");
      return;
    }
  
    try {
      setError(null);
      setCurrentStep('upload');
  
      const formData = new FormData();
      formData.append('report', file);
      const uploadResponse = await axios.post('/api/report/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      if (uploadResponse.status !== 200) {
        throw new Error("File upload failed.");
      }
  
      setCurrentStep('analyze');
      const analyzeResponse = await axios.get('/api/report/analyze');
  
      if (analyzeResponse.status !== 200) {
        throw new Error("Report analysis failed.");
      }
  
      setCurrentStep('summarize');
      const summaryResponse = await axios.get('/api/report/summarize');
  
      if (summaryResponse.status !== 200) {
        throw new Error("Report summarization failed.");
      }

      setSummary(summaryResponse.data);
      setCurrentStep('complete');
    } catch (error) {
      console.error("Error during file processing:", error);
  
      setError(
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred. Please try again."
      );
      setCurrentStep(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Report Analysis</h1>
      <div className="mb-8">
        <div className="flex items-center justify-center w-full">
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <CloudArrowUpIcon className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
              <p className="text-xs text-gray-500">PDF, JPG, JPEG, or PNG (MAX. 10MB)</p>
            </div>
            <input id="file-upload" type="file" className="hidden" onChange={handleFile} accept=".pdf,.jpg,.jpeg,.png" />
          </label>
        </div>
        {file && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <span className="text-sm text-blue-700">{file.name}</span>
            <button
              onClick={handleAnalyze}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Analyze Report
            </button>
          </div>
        )}
      </div>

      {currentStep && currentStep !== 'complete' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Processing your report</h2>
          <div className="space-y-4">
            {processSteps.map((step) => (
              <div key={step.id} className="flex items-center">
                {currentStep === step.id ? (
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                ) : currentStep && processSteps.findIndex(s => s.id === currentStep) > processSteps.findIndex(s => s.id === step.id) ? (
                  <CheckCircleIcon className="mr-3 h-5 w-5 text-green-500" />
                ) : (
                  <div className="mr-3 h-5 w-5 rounded-full border-2 border-gray-300"></div>
                )}
                <span className={`text-sm ${currentStep === step.id ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {summary && <Result result={summary} />}
    </div>
  );
}
