declare module 'cookie' {
  export function parse(str: string, options?: any): { [key: string]: string };
  export function serialize(name: string, value: string, options?: any): string;
}
