import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../../theme';

interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  /** Minimum height per row so paired cards align. */
  rowMinHeight?: number;
}

/**
 * Two-column grid with equal-height items per row.
 * Chunks children into rows so cards in the same row always match height.
 */
export function Grid({
  children,
  columns = 2,
  gap = Spacing.md,
  rowMinHeight = 152,
}: GridProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  const rows: React.ReactNode[][] = [];

  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.row, { gap, minHeight: rowMinHeight, marginBottom: rowIndex < rows.length - 1 ? gap : 0 }]}
        >
          {row.map((item, colIndex) => (
            <View key={colIndex} style={styles.cell}>
              {item}
            </View>
          ))}
          {row.length < columns &&
            Array.from({ length: columns - row.length }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.cell} />
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
});
