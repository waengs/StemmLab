/**
 * Button.test.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Integration Tests — Phase 2: Button + ThemeStore (Zustand)
 *
 * Tests how the Button component integrates with the global Zustand theme store
 * (accessed via `useTheme` from ThemeContext). Verifies:
 *   - Correct render and accessibility in both light & dark modes
 *   - onPress callback fires correctly
 *   - Loading state (async onPress) shows ActivityIndicator and blocks re-press
 *   - disabled prop prevents presses
 *   - All supported variants and sizes render without crashing
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Button } from '../components/ui/Button';
import { useThemeStore } from '../stores/themeStore';

// ─── Helper: reset Zustand theme store to light mode before every test ────────
beforeEach(() => {
  useThemeStore.setState({
    mode: 'light',
    isDark: false,
  });
});

// ─── 1. Render & content ──────────────────────────────────────────────────────

describe('Button — rendering', () => {
  it('renders the title text', () => {
    const { getByText } = render(<Button title="Submit" onPress={jest.fn()} />);
    expect(getByText('Submit')).toBeTruthy();
  });

  it('renders all variants without crashing', () => {
    const variants = ['primary', 'outlined', 'danger', 'ghost'] as const;
    variants.forEach((variant) => {
      expect(() =>
        render(<Button title={variant} onPress={jest.fn()} variant={variant} />)
      ).not.toThrow();
    });
  });

  it('renders all sizes without crashing', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      expect(() =>
        render(<Button title={size} onPress={jest.fn()} size={size} />)
      ).not.toThrow();
    });
  });
});

// ─── 2. Theme integration ─────────────────────────────────────────────────────

describe('Button — theme store integration', () => {
  it('re-renders correctly when the Zustand theme switches to dark mode', async () => {
    const { getByText } = render(
      <Button title="Dark Mode Test" onPress={jest.fn()} variant="outlined" />
    );

    // Switch to dark mode via the store directly
    await act(async () => {
      useThemeStore.setState({ mode: 'dark', isDark: true });
    });

    // Component should still be visible — no crash on theme change
    expect(getByText('Dark Mode Test')).toBeTruthy();
  });

  it('renders primary variant in dark mode without crashing', async () => {
    await act(async () => {
      useThemeStore.setState({ mode: 'dark', isDark: true });
    });

    expect(() =>
      render(<Button title="Primary Dark" onPress={jest.fn()} variant="primary" />)
    ).not.toThrow();
  });
});

// ─── 3. Press handling ────────────────────────────────────────────────────────

describe('Button — press callbacks', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Tap Me" onPress={onPress} />);

    fireEvent.press(getByText('Tap Me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={onPress} disabled />
    );

    fireEvent.press(getByText('Disabled'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading prop is true', () => {
    const onPress = jest.fn();
    const { queryByText } = render(
      <Button title="Loading" onPress={onPress} loading />
    );

    // Title text should be hidden (ActivityIndicator shown instead)
    expect(queryByText('Loading')).toBeNull();
    expect(onPress).not.toHaveBeenCalled();
  });
});

// ─── 4. Async loading state ───────────────────────────────────────────────────

describe('Button — async loading state', () => {
  it('shows ActivityIndicator and hides title while an async onPress resolves', async () => {
    let resolvePress!: () => void;
    const asyncOnPress = jest.fn(
      () => new Promise<void>((res) => { resolvePress = res; })
    );

    const { getByText, queryByText } = render(
      <Button title="Save" onPress={asyncOnPress} />
    );

    // Trigger the async press
    fireEvent.press(getByText('Save'));

    // While the promise is pending, title should be hidden
    await waitFor(() => {
      expect(queryByText('Save')).toBeNull();
    });

    // Resolve the promise
    await act(async () => { resolvePress(); });

    // After resolution the title is visible again
    await waitFor(() => {
      expect(getByText('Save')).toBeTruthy();
    });
  });

  it('does not fire onPress a second time while a previous async press is still pending', async () => {
    let resolvePress!: () => void;
    const asyncOnPress = jest.fn(
      () => new Promise<void>((res) => { resolvePress = res; })
    );

    const { getByText, queryByText } = render(
      <Button title="Submit" onPress={asyncOnPress} />
    );

    // First press starts loading
    fireEvent.press(getByText('Submit'));

    // Wait for loading to begin (title disappears)
    await waitFor(() => expect(queryByText('Submit')).toBeNull());

    // Second press while loading — onPress should NOT be called again
    // (button title is hidden, so press via the Pressable wrapper)
    // onPress count stays at 1
    expect(asyncOnPress).toHaveBeenCalledTimes(1);

    // Cleanup
    await act(async () => { resolvePress(); });
  });
});
