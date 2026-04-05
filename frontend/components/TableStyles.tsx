// components/TableStyles.tsx
import { StyleSheet } from 'react-native';

/**
 * Available styles:
 * -headerRow
 * -row
 * -cell
 * -colIndex
 * -colVoucher
 * -colValue
 * -bold
 * -totalRow
 */

const TableStyles = StyleSheet.create({

  headerRow: {
    flexDirection: 'row',
    borderWidth: 1,
    backgroundColor: '#202020',
  },

  row: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: '#560324',
  },

  cell: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },

  colIndex: {
    flex: 1,
  },

  colVoucher: {
    flex: 3,
  },

  colValue: {
    flex: 2,
    alignItems: 'flex-end',
  },

  bold: {
    fontWeight: 'bold',
  },

  totalRow: {
    flexDirection: 'row',
    borderWidth: 2,
    backgroundColor: '#f2f2f2',
  },

});

export default TableStyles;