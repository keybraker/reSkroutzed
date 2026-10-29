import { afterEach, describe, expect, it } from 'vitest';

import {
  AI_HIDE_CLASS,
  AI_SLOP_SELECTOR,
  ensureAISlopStyleInjected,
  queryAISlopNodes,
} from '../../../src/common/functions/aiSlop';

const AI_SUMMARY_HTML = `
  <div class="reviews-ai-summary">
    <div class="reviews-ai-summary-header">
      <h3 class="reviews-ai-summary-title">
        Τι λένε οι χρήστες;
        <span class="reviews-ai-summary-sr-label">Περίληψη δημιουργημένη από AI</span>
      </h3>
    </div>
    <p class="reviews-ai-summary-text">Οι χρήστες είναι συνολικά πολύ ικανοποιημένοι.</p>
  </div>
`;

describe('aiSlop', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.getElementById('resk-ai-hide-style')?.remove();
  });

  describe('queryAISlopNodes', () => {
    it('matches the AI generated reviews summary', () => {
      // Arrange
      document.body.innerHTML = AI_SUMMARY_HTML;

      // Act
      const nodes = queryAISlopNodes();

      // Assert
      expect(nodes).toHaveLength(1);
      expect(nodes[0].classList.contains('reviews-ai-summary')).toBe(true);
    });

    it('matches the AI slop elements of the site', () => {
      // Arrange
      document.body.innerHTML = `
        <div class="sofos-entrypoint"></div>
        <div class="sofos-listing-shelf"></div>
        <div class="sofos-chat-button"></div>
        <div class="shifu-chat-button"></div>
        <div class="unrelated-element"></div>
      `;

      // Act
      const nodes = queryAISlopNodes();

      // Assert
      expect(nodes).toHaveLength(4);
      expect(AI_SLOP_SELECTOR).toContain('.reviews-ai-summary');
    });
  });

  describe('ensureAISlopStyleInjected', () => {
    it('injects the hiding stylesheet once', () => {
      // Arrange
      document.body.innerHTML = '';

      // Act
      ensureAISlopStyleInjected();
      ensureAISlopStyleInjected();

      // Assert
      const styles = document.querySelectorAll('#resk-ai-hide-style');
      expect(styles).toHaveLength(1);
      expect(styles[0].textContent).toContain(`.${AI_HIDE_CLASS}`);
    });
  });
});
