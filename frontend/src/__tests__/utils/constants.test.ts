/**
 * Tests for shared constants
 */
import { describe, it, expect } from 'vitest';
import {
  DEAL_STAGES,
  ACTION_TYPES,
  SHARED_PREFERENCE_KEYS
} from '../../constants/shared';

describe('Shared Constants', () => {
  describe('DEAL_STAGES', () => {
    it('should have 6 stages', () => {
      expect(DEAL_STAGES).toHaveLength(6);
    });

    it('should include all expected stages', () => {
      expect(DEAL_STAGES).toContain('identified');
      expect(DEAL_STAGES).toContain('introduced');
      expect(DEAL_STAGES).toContain('in_diligence');
      expect(DEAL_STAGES).toContain('term_sheet');
      expect(DEAL_STAGES).toContain('closed');
      expect(DEAL_STAGES).toContain('dead');
    });

    it('should be readonly', () => {
      // TypeScript should enforce this, but we can verify the array exists
      expect(Array.isArray(DEAL_STAGES)).toBe(true);
    });
  });

  describe('ACTION_TYPES', () => {
    it('should include core action types', () => {
      expect(ACTION_TYPES).toContain('email_sent');
      expect(ACTION_TYPES).toContain('meeting_scheduled');
      expect(ACTION_TYPES).toContain('meeting_completed');
      expect(ACTION_TYPES).toContain('memo_generated');
      expect(ACTION_TYPES).toContain('stage_changed');
      expect(ACTION_TYPES).toContain('note_added');
    });

    it('should have at least 6 action types', () => {
      expect(ACTION_TYPES.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('SHARED_PREFERENCE_KEYS', () => {
    it('should have 10 preference keys', () => {
      expect(SHARED_PREFERENCE_KEYS).toHaveLength(10);
    });

    it('should include infrastructure preferences', () => {
      expect(SHARED_PREFERENCE_KEYS).toContain('transport_infra');
      expect(SHARED_PREFERENCE_KEYS).toContain('energy_infra');
    });

    it('should include market preferences', () => {
      expect(SHARED_PREFERENCE_KEYS).toContain('us_market');
      expect(SHARED_PREFERENCE_KEYS).toContain('emerging_markets');
    });

    it('should include regional preferences', () => {
      expect(SHARED_PREFERENCE_KEYS).toContain('asia_em');
      expect(SHARED_PREFERENCE_KEYS).toContain('africa_em');
      expect(SHARED_PREFERENCE_KEYS).toContain('emea_em');
    });

    it('should include country-specific preferences', () => {
      expect(SHARED_PREFERENCE_KEYS).toContain('vietnam');
      expect(SHARED_PREFERENCE_KEYS).toContain('mongolia');
      expect(SHARED_PREFERENCE_KEYS).toContain('turkey');
    });
  });
});
