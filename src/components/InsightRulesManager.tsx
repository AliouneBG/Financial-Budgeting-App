import React, { useState } from 'react';
import type { InsightRule } from '../types';

interface InsightRulesManagerProps {
  rules: InsightRule[];
  onRuleToggle: (ruleId: string, enabled: boolean) => void;
}

const InsightRulesManager: React.FC<InsightRulesManagerProps> = ({ rules, onRuleToggle }) => {
  const [enabledRules, setEnabledRules] = useState<Record<string, boolean>>(
    rules.reduce((acc, rule) => ({ ...acc, [rule.id]: true }), {})
  );

  const handleToggle = (ruleId: string) => {
    const newEnabled = !enabledRules[ruleId];
    setEnabledRules(prev => ({ ...prev, [ruleId]: newEnabled }));
    onRuleToggle(ruleId, newEnabled);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Insight Rules Management</h2>
      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium">{rule.name}</h3>
              <p className="text-sm text-gray-600">{rule.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={enabledRules[rule.id]}
                onChange={() => handleToggle(rule.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightRulesManager;