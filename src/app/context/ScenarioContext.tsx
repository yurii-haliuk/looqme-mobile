import { createContext, useContext, useState, ReactNode } from 'react';
import type { Organization } from '../data/mock';

export type ScenarioType = 'normal' | 'warning' | 'exhausted';

interface ScenarioContextType {
  scenario: ScenarioType;
  setScenario: (scenario: ScenarioType) => void;
  getOrgWithScenario: (baseOrg: Organization) => Organization;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<ScenarioType>('normal');

  const getOrgWithScenario = (baseOrg: Organization): Organization => {
    switch (scenario) {
      case 'normal':
        // 0-74% usage
        return {
          ...baseOrg,
          usage: {
            mentions_used: Math.floor(baseOrg.limits.mentions * 0.47), // 47%
            ai_coding_used: Math.floor(baseOrg.limits.ai_coding * 0.45), // 45%
            ai_assistants_used: Math.floor(baseOrg.limits.ai_assistants * 0.4), // 40%
            pages_used: Math.floor(baseOrg.limits.pages * 0.24), // 24%
            keywords_count: Math.floor(baseOrg.limits.keywords * 0.64), // 64%
          },
        };
      case 'warning':
        // Mixed: some normal, some warning
        return {
          ...baseOrg,
          usage: {
            mentions_used: Math.floor(baseOrg.limits.mentions * 0.78), // 78% warning
            ai_coding_used: Math.floor(baseOrg.limits.ai_coding * 0.92), // 92% warning
            ai_assistants_used: Math.floor(baseOrg.limits.ai_assistants * 0.4), // 40% normal
            pages_used: Math.floor(baseOrg.limits.pages * 0.86), // 86% warning
            keywords_count: Math.floor(baseOrg.limits.keywords * 0.64), // 64% normal
          },
        };
      case 'exhausted':
        // Mixed: some exhausted, some warning, some normal
        return {
          ...baseOrg,
          usage: {
            mentions_used: baseOrg.limits.mentions, // 100% exhausted
            ai_coding_used: baseOrg.limits.ai_coding, // 100% exhausted
            ai_assistants_used: Math.floor(baseOrg.limits.ai_assistants * 0.8), // 80% warning
            pages_used: Math.floor(baseOrg.limits.pages * 0.24), // 24% normal
            keywords_count: Math.floor(baseOrg.limits.keywords * 0.95), // 95% warning
          },
        };
      default:
        return baseOrg;
    }
  };

  return (
    <ScenarioContext.Provider value={{ scenario, setScenario, getOrgWithScenario }}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within ScenarioProvider');
  }
  return context;
}
