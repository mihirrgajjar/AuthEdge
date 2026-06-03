declare module 'react-native-sqlcipher-storage' {
  export interface Database {
    executeSql(sqlStatement: string, arguments?: any[]): Promise<[ResultSet]>;
    transaction(txFn: (tx: Transaction) => void, errorCb?: (error: any) => void, successCb?: () => void): Promise<void>;
    close(): Promise<void>;
  }

  export interface ResultSet {
    insertId: number;
    rowsAffected: number;
    rows: {
      length: number;
      item(index: number): any;
    };
  }

  export interface Transaction {
    executeSql(sqlStatement: string, arguments?: any[]): Promise<[Transaction, ResultSet]>;
  }

  export function openDatabase(
    params: { name: string; key: string; location?: string },
    successCb?: () => void,
    errorCb?: (error: any) => void
  ): Promise<Database>;

  export function deleteDatabase(
    params: { name: string; location?: string },
    successCb?: () => void,
    errorCb?: (error: any) => void
  ): Promise<void>;

  export function enablePromise(enable: boolean): void;
}
