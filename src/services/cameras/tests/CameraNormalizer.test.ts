import { describe, it, expect } from 'vitest';
import { CameraNormalizer } from '../core/CameraNormalizer.js';
import { validateNormalizedCamera } from '../core/CameraValidation.js';
import { normalizeNYCDOTCamera } from '../connectors/nycdot/NYCDOTNormalizer.js';
import { normalizeNJ511Camera } from '../connectors/nj511/NJ511Normalizer.js';
import { normalizeNJTACamera } from '../connectors/njta/NJTANormalizer.js';

describe('CameraNormalizer', () => {
  it('normalizes NYCDOT camera item correctly', () => {
    const raw = {
      id: 'cam-999',
      name: 'Broad St @ Market St',
      area: 'Manhattan',
      latitude: 40.7357,
      longitude: -74.1724,
      isOnline: 'true'
    };
    const normalized = normalizeNYCDOTCamera(raw);
    expect(normalized.id).toBe('NYCDOT-cam-999');
    expect(normalized.mediaType).toBe('REFRESHED_IMAGE');
    expect(normalized.status).toBe('AVAILABLE');
    expect(validateNormalizedCamera(normalized)).toBe(true);
  });

  it('normalizes NJ511 camera item correctly', () => {
    const raw = {
      id: '101',
      name: 'Broad St Corridor',
      roadway: 'Broad St',
      direction: 'Northbound',
      lat: 40.7357,
      lng: -74.1724,
      imageUrl: 'https://511nj.org/image.jpg'
    };
    const normalized = normalizeNJ511Camera(raw);
    expect(normalized.id).toBe('NJ511-101');
    expect(normalized.mediaType).toBe('REFRESHED_IMAGE');
    expect(normalized.attribution.agency).toContain('NJDOT');
    expect(validateNormalizedCamera(normalized)).toBe(true);
  });

  it('normalizes NJTA camera item correctly', () => {
    const raw = {
      id: 'EXIT14',
      name: 'NJ Turnpike Exit 14',
      roadway: 'NJ Turnpike',
      lat: 40.6980,
      lng: -74.1780,
      imageUrl: 'https://njta.gov/cam.jpg'
    };
    const normalized = normalizeNJTACamera(raw);
    expect(normalized.id).toBe('NJTA-EXIT14');
    expect(normalized.sourceSystem).toBe('NJTA');
    expect(validateNormalizedCamera(normalized)).toBe(true);
  });

  it('validates camera records and rejects invalid ones', () => {
    const invalid = {
      id: '',
      name: 'Invalid Camera',
      mediaType: 'NOT_A_REAL_TYPE'
    };
    expect(validateNormalizedCamera(invalid)).toBe(false);
  });
});
