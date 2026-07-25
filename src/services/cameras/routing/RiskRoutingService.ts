import type { NormalizedCamera } from '../core/CameraTypes.js';

export type RiskLevel = 'LOW' | 'HIGH' | 'CRITICAL';

export interface ObservationRoutingRule {
  category: string;
  riskLevel: RiskLevel;
  action: 'AUTO_DRAFT_SERVICE_REQUEST' | 'HUMAN_VERIFICATION_REQUIRED';
  targetDepartment: string;
  autoDispatch: boolean;
  autoEnforcement: boolean;
  publishAlertAutomatically: boolean;
}

export class RiskRoutingService {
  private static rules: Record<string, ObservationRoutingRule> = {
    'pothole': {
      category: 'Pothole & Road Damage',
      riskLevel: 'LOW',
      action: 'AUTO_DRAFT_SERVICE_REQUEST',
      targetDepartment: 'Public Works & Infrastructure',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    },
    'illegal_dumping': {
      category: 'Illegal Dumping / Refuse',
      riskLevel: 'LOW',
      action: 'AUTO_DRAFT_SERVICE_REQUEST',
      targetDepartment: 'Sanitation & Code Enforcement',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    },
    'graffiti': {
      category: 'Graffiti & Vandalism',
      riskLevel: 'LOW',
      action: 'AUTO_DRAFT_SERVICE_REQUEST',
      targetDepartment: 'Public Works',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    },
    'overflowing_trash': {
      category: 'Overflowing Trash Container',
      riskLevel: 'LOW',
      action: 'AUTO_DRAFT_SERVICE_REQUEST',
      targetDepartment: 'Sanitation Department',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    },
    'minor_streetlight': {
      category: 'Streetlight Outage',
      riskLevel: 'LOW',
      action: 'AUTO_DRAFT_SERVICE_REQUEST',
      targetDepartment: 'Electrical Operations',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    },
    // High / Safety Critical Risks
    'fire': {
      category: 'Smoke or Fire',
      riskLevel: 'CRITICAL',
      action: 'HUMAN_VERIFICATION_REQUIRED',
      targetDepartment: 'Fire Rescue EOC',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    },
    'flooding': {
      category: 'Roadway Flooding',
      riskLevel: 'HIGH',
      action: 'HUMAN_VERIFICATION_REQUIRED',
      targetDepartment: 'Emergency Management & Water Utilities',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    },
    'structural_failure': {
      category: 'Structural Facade Decay / Collapse',
      riskLevel: 'CRITICAL',
      action: 'HUMAN_VERIFICATION_REQUIRED',
      targetDepartment: 'Code Enforcement & Fire Rescue',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    },
    'traffic_signal_falling': {
      category: 'Traffic Signal Hazard',
      riskLevel: 'HIGH',
      action: 'HUMAN_VERIFICATION_REQUIRED',
      targetDepartment: 'Traffic Engineering EOC',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    },
    'major_collision': {
      category: 'Possible Crash / Vehicle Collision',
      riskLevel: 'HIGH',
      action: 'HUMAN_VERIFICATION_REQUIRED',
      targetDepartment: 'Police CAD & Emergency Management',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    }
  };

  public static evaluateRouting(categoryKey: string, camera: NormalizedCamera): ObservationRoutingRule {
    const key = categoryKey.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const matched = Object.keys(this.rules).find(k => key.includes(k));

    if (matched) {
      return this.rules[matched];
    }

    // Default conservative fallback: Require human verification, never auto-dispatch
    return {
      category: categoryKey,
      riskLevel: 'HIGH',
      action: 'HUMAN_VERIFICATION_REQUIRED',
      targetDepartment: 'Municipal EOC Triage Queue',
      autoDispatch: false,
      autoEnforcement: false,
      publishAlertAutomatically: false
    };
  }
}
