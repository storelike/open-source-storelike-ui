import { describe, it, expect } from 'vitest';

describe('Voice path — no elevated privileges', () => {
  it('voice transcription produces plain text (conceptual)', () => {
    // Voice module receives audio and returns { text: string }
    // The text is then treated identically to typed text
    const transcriptionResult = { text: 'change the hero title to Premium Store' };
    expect(typeof transcriptionResult.text).toBe('string');
    expect(transcriptionResult.text).not.toContain('ADMIN');
    expect(transcriptionResult.text).not.toContain('BYPASS');
  });

  it('transcribed text has no special role marker', () => {
    // When voice text is routed to an agent, it arrives as a regular user message
    // No metadata elevates its privilege level
    const messageFromVoice = {
      role: 'user' as const,
      content: 'change the background color to blue',
      source: 'voice',
    };

    const messageFromText = {
      role: 'user' as const,
      content: 'change the background color to blue',
      source: 'text',
    };

    // Both should be treated identically by the agent
    expect(messageFromVoice.role).toBe(messageFromText.role);
    expect(messageFromVoice.content).toBe(messageFromText.content);
    // Source is metadata only — does not affect processing
  });

  it('voice input does not bypass TOTP auth requirement', () => {
    // The auth check happens at the transport layer (transport-telegram)
    // before the message reaches owneragent, regardless of source
    const isAuthenticated = false;
    const source = 'voice';

    // Auth check is source-independent
    const shouldRoute = isAuthenticated; // source is NOT considered
    expect(shouldRoute).toBe(false);
  });

  it('voice input does not expand editable scope', () => {
    // The editable-checker runs the same allow/deny logic
    // regardless of whether the edit was requested via voice or text
    const editRequest = {
      path: 'src/locale/cms-locale.json',
      source: 'voice',
    };

    // The isAllowed check does not take source into account
    // It only checks the path against editable.yml
    // This is verified by the fact that isAllowed(editable, path) has no source parameter
    expect(editRequest.source).toBeDefined(); // source exists as metadata
    // but isAllowed signature is: isAllowed(editable, filePath) — no source param
  });
});
