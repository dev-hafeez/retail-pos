declare module 'better-sqlite3' {
    interface Statement {
      run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
      get(...params: any[]): any;
      all(...params: any[]): any[];
      iterate(...params: any[]): IterableIterator<any>;
      bind(...params: any[]): Statement;
      columns(): Array<{ name: string; column: string | null }>;
    }
  
    interface Database {
      prepare(sql: string): Statement;
      transaction(fn: Function): Function;
      pragma(pragma: string, simplify?: boolean): any;
      checkpoint(databaseName?: string): void;
      function(name: string, fn: Function): void;
      aggregate(name: string, options: { start: any; step: Function; result?: Function }): void;
      loadExtension(path: string): void;
      exec(sql: string): void;
      close(): void;
      defaultSafeIntegers(toggleState?: boolean): Database;
      backup(destination: string | Database, options?: { attached?: string; progress?: Function }): Promise<void>;
    }
  
    interface DatabaseConstructor {
      new(filename: string, options?: { readonly?: boolean; fileMustExist?: boolean; timeout?: number; verbose?: Function }): Database;
      (filename: string, options?: { readonly?: boolean; fileMustExist?: boolean; timeout?: number; verbose?: Function }): Database;
    }
  
    const Database: DatabaseConstructor;
    export = Database;
  }