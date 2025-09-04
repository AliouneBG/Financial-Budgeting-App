import React from 'react';
import { type AuditLog } from '../types';

interface Props {
  logs: AuditLog[];
  showDiff?: (log: AuditLog) => void;
}

const AuditLogViewer: React.FC<Props> = ({ logs, showDiff }) => (
  <div className="mt-4">
    <h3 className="font-medium mb-2">Recent Activity</h3>
    <ul className="max-h-60 overflow-y-auto">
      {logs.slice(-5).map((log) => (
        <li key={log.id} className="py-2 border-b last:border-b-0">
          <div className="text-sm text-gray-500">
            {new Date(log.timestamp).toLocaleTimeString()}
          </div>
          <div>
            {log.action} {log.entityType}
            {showDiff && (
              <button
                className="ml-2 text-blue-600 text-sm"
                onClick={() => showDiff(log)}
              >
                View Changes
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default AuditLogViewer;
