import { DataTableRow } from '../components/row/row.component';
import { DataTableColumn } from '../directives/column/column.directive';

export type CellCallback = (item: any, row: DataTableRow, column: DataTableColumn, index: number) => string;
