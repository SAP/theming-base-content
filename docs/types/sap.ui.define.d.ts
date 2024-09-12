declare namespace sap {
  namespace ui {
    function define(dependencies: string[], factory: (...modules: any[]) => any): void;
    function define(factory: (...modules: any[]) => any): void;
    export {define};
  }
}
