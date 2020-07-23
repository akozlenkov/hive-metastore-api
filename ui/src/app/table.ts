export class Column {
  name: string;
  type: string;
  comment: string;
}

export class SerDeInfo {
  serializationLib: string;
  parameters: Map<string, string>;
}

export class StorageDescriptor {
  columns: Column[];
  location: string;
  inputFormat: string;
  outputFormat: string;
  serDeInfo: SerDeInfo;
  parameters: Map<string, string>;
}

export class Table {
  name: string;
  database: string;
  owner: string;
  tableType: string;
  storageDescriptor: StorageDescriptor;
  partitionKeys: Column[];
  parameters: Map<string, string>;
}
