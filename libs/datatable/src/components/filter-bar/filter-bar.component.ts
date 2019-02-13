import { Component, forwardRef, Inject, OnInit } from '@angular/core';
import { PopupDialogService } from 'ngx-popup-dialog';

import { Filter } from '../../types/filter.type';
import { FilterableField } from '../../types/filterable-field.type';
import { DataTableComponent } from '../table/table.component';
import { FieldFilterChooserPopupDialog } from './field-filter-chooser-popup-dialog/field-filter-chooser-popup-dialog';
import { FieldFilterPopupDialog } from './field-filter-popup-dialog/field-filter-popup-dialog';

interface ChipFieldFilter {
  fieldFilter: Filter;
}

@Component({
  selector: 'filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css']
})
export class FilterBarComponent implements OnInit {
  filters: ChipFieldFilter[] = [];

  fields: FilterableField[];

  constructor(
    @Inject(forwardRef(() => DataTableComponent)) public dataTable: DataTableComponent,
    public popupDialogService: PopupDialogService) {
    this.fields = this.dataTable.filterableFields;
  }

  ngOnInit() {
  }

  inputFocused(event: Event) {
    this.openFieldChooserDialog(event.currentTarget);
  }

  chipClicked(event: Event, chipFilter: ChipFieldFilter) {
    const dialogRef = this.openFieldFilterDialog(event.currentTarget, chipFilter.fieldFilter);
    dialogRef.afterClosed().subscribe((result: Filter) => {
      if (!result) return;
      this.dataTable.filterUpdated.emit({ old: this.convertFilterToEmittedFilter(chipFilter.fieldFilter), new: this.convertFilterToEmittedFilter(result) });
      let index = this.filters.indexOf(chipFilter)
      this.filters[index].fieldFilter = result;
      this.dataTable.filterChanged.emit(this.filters.map(c => this.convertFilterToEmittedFilter(c.fieldFilter)));
      chipFilter.fieldFilter = result;
    });
  }

  openFieldChooserDialog(triggeredElement) {
    const dialogRef = this.popupDialogService.open(
      FieldFilterChooserPopupDialog,
      triggeredElement,
      {
        maxHeight: 300,
        coverTriggeringElement: true,
        data: {
          fields: this.fields,
          labels: this.dataTable.labels
        }
      });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const dialogRef = this.openFieldFilterDialog(triggeredElement, { field: result });
      dialogRef.afterClosed().subscribe((result: Filter) => {
        if (!result) return;
        this.filters.push({ fieldFilter: result });
        this.dataTable.filterAdded.emit(this.convertFilterToEmittedFilter(result));
        this.dataTable.filterChanged.emit(this.filters.map(c => this.convertFilterToEmittedFilter(c.fieldFilter)));
      });
    });
  }

  openFieldFilterDialog(triggeredElement, filter?: Filter) {
    const dialogRef = this.popupDialogService.open(
      FieldFilterPopupDialog,
      triggeredElement,
      {
        suppressCloseOnClickSelectors: ['.cdk-overlay-container'],
        coverTriggeringElement: true,
        data: {
          fieldFilter: filter,
          labels: this.dataTable.labels
        }
      });
    return dialogRef;
  }

  removeFilter(chipFilter: ChipFieldFilter) {
    const index = this.filters.indexOf(chipFilter);

    if (index >= 0) {
      this.filters.splice(index, 1);
      this.dataTable.filterRemoved.emit(this.convertFilterToEmittedFilter(chipFilter.fieldFilter));
      this.dataTable.filterChanged.emit(this.filters.map(c => this.convertFilterToEmittedFilter(c.fieldFilter)));
    }
  }

  formatValue(filter: Filter) {
    if (filter.field.dataType == "enum") {
      return (filter.value as any[]).map(v => typeof v === "string" ? v : v.displayText);
    }
    return filter.value;
  }

  private convertFilterToEmittedFilter(filter: Filter) {
    // clone the filter and extract values from enum possible options
    let clonedFilter = JSON.parse(JSON.stringify(filter)) as Filter;
    if (clonedFilter.field.dataType == "enum") {
      let valuesList = clonedFilter.value;
      for (let i = 0; i < valuesList.length; i++) {
        const value = valuesList[i];
        valuesList[i] = typeof value === "string" ? value : value.value
      }
    }
    return clonedFilter;
  }
}
