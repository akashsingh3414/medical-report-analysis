import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const Result = ({ result }) => {
  if (!result?.analysis) return null;

  const { analysis } = result;

  const SectionCard = ({ title, children, className = "" }) => {
    if (!children) return null;
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 mb-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };

    return (
      <span className={`px-2 py-1 rounded text-sm ${colors[status.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  };

  if (analysis.error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-6">
            <ExclamationCircleIcon className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-red-800">Error in Analysis</h2>
          </div>
          <p className="text-gray-600">{analysis.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center mb-6">
          <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Medical Report Analysis</h2>
        </div>

        <div className="space-y-6">
          {analysis.summary?.key_findings && (
            <SectionCard title="Summary of Key Findings">
              <p>{analysis.summary.key_findings}</p>
            </SectionCard>
          )}

          {analysis.anomalies_analysis?.length > 0 && (
            <SectionCard title="Anomalies Analysis">
              {analysis.anomalies_analysis.map((anomaly, idx) => (
                <div key={idx} className="border-l-4 border-red-500 pl-4 mb-4">
                  <h4 className="font-semibold text-lg">{anomaly.anomaly}</h4>
                  <p className="text-gray-600">Potential Causes: {anomaly.potential_causes.join(", ")}</p>
                  <StatusBadge status={anomaly.severity} />
                </div>
              ))}
            </SectionCard>
          )}

          {analysis.personalized_suggestions?.length > 0 && (
            <SectionCard title="Personalized Health Suggestions">
              <ul className="list-disc pl-4">
                {analysis.personalized_suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion.suggestion}</li>
                ))}
              </ul>
            </SectionCard>
          )}

          {analysis.critical_findings?.length > 0 && (
            <SectionCard title="Critical Findings and Warnings">
              {analysis.critical_findings.map((finding, idx) => (
                <div key={idx} className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold">{finding.finding}</h4>
                  <p className="text-gray-600">Action Required: {finding.action_required}</p>
                  <StatusBadge status={finding.urgency} />
                </div>
              ))}
            </SectionCard>
          )}

          {analysis.follow_up_recommendations?.length > 0 && (
            <SectionCard title="Follow-Up Recommendations">
              <ul className="list-disc pl-4">
                {analysis.follow_up_recommendations.map((recommendation, idx) => (
                  <li key={idx}>
                    {recommendation.test_or_procedure} - {recommendation.reason}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Result;
