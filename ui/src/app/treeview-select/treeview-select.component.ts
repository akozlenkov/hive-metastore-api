import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, ViewEncapsulation, OnInit } from '@angular/core';
import { isNil } from 'lodash';
import { TreeviewI18n, TreeviewItem, TreeviewConfig, TreeviewComponent, TreeviewHelper } from 'ngx-treeview';
import { faPlus, faMinus, faTable, faDatabase } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'ngx-treeview-select',
  templateUrl: './treeview-select.component.html',
  styleUrls: ['./treeview-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class TreeviewSelectComponent implements OnInit, OnChanges {
  @Input() config: TreeviewConfig;
  @Input() items: TreeviewItem[];
  @Input() filterText: string;
  @Input() eventEmitter: EventEmitter<any>;
  @Input() selectedItem: TreeviewItem;
  @Output() itemSelected = new EventEmitter<TreeviewItem>();
  @ViewChild(TreeviewComponent, { static: false }) treeviewComponent: TreeviewComponent;

  faPlus = faPlus
  faMinus = faMinus
  faTable = faTable;
  faDatabase = faDatabase;

  constructor(public i18n: TreeviewI18n) {}

  ngOnInit() {
    this.eventEmitter.subscribe(event => {
      this.treeviewComponent.onFilterTextChange(event);
    });
  }

  ngOnChanges(): void {
    this.updateSelectedItem();
  }

  private updateSelectedItem(): void {
    if (!isNil(this.items)) {
      const selectedItem = TreeviewHelper.findItemInList(this.items, this.selectedItem);
      this.selectItem(selectedItem);
    }
  }

  public selectItem(item: TreeviewItem): void {
    if (item && item !== this.selectedItem) {
      item['active'] = true;
      if (this.selectedItem) {
        delete this.selectedItem['active'];
      }
      this.itemSelected.emit(item);
    }
  }
}
