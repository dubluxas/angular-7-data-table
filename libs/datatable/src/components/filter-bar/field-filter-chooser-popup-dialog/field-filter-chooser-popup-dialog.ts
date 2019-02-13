import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { POPUP_DIALOG_CLOSE } from 'ngx-popup-dialog';

import { DataTableTranslations } from '../../../types/data-table-translations.type';
import { FilterableField } from '../../../types/filterable-field.type';

interface DialogData {
  fields: FilterableField[];
  labels: DataTableTranslations
}

// @dynamic
@Component({
  selector: 'app-field-filter-chooser-popup-dialog',
  templateUrl: './field-filter-chooser-popup-dialog.html',
  styleUrls: ['./field-filter-chooser-popup-dialog.css']
})
export class FieldFilterChooserPopupDialog implements OnInit {
  fieldSearchQuery = '';
  filteredFields: FilterableField[];
  constructor(
    @Inject(POPUP_DIALOG_CLOSE) private _dialogCloser: (dialogResult?: any) => void,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.filteredFields = data.fields;
  }

  ngOnInit() {
  }

  onFieldSearch(searchQuery: string) {
    this.filteredFields = this.data.fields.filter(c => c.header.toLowerCase().indexOf(searchQuery.toLowerCase()) != -1);
  }
  fieldSelected(field: FilterableField) {
    this._dialogCloser(field);
  }

}
