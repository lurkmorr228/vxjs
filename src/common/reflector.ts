import type { Fn, MethodDecoratorFactory, TypeOf } from './types';

export interface DecoratedMethod<TValue> {
  method: Fn;
  decorators: TValue[];
}

export class Reflector {
  private static getAllMethodNames<TClass>(obj: TypeOf<TClass>): (keyof TClass)[] {
    const methods = new Set();
    while ((obj = Reflect.getPrototypeOf(obj) as any)) {
      const keys = Reflect.ownKeys(obj);
      keys.forEach((k) => methods.add(k));
    }

    return [...(methods as never)] as (keyof TClass)[];
  }

  public static getDecoratedMethods<TClass, TValue>(
    target: TClass,
    decorator: MethodDecoratorFactory,
  ): DecoratedMethod<TValue>[] {
    const prototype: TypeOf<TClass> = target as never;

    return this.getAllMethodNames(prototype)
      .map((method) => {
        const metadata = this.getMethodDecorators<TClass, TValue>(target, decorator, method as string);

        if (metadata.length === 0) {
          return null;
        }

        return {
          method: (target[method] as Fn).bind(target),
          decorators: metadata,
        };
      })
      .filter((x) => x !== null);
  }

  public static getClassDecorator<TClass, TValue>(target: TClass, decorator: MethodDecoratorFactory): TValue {
    return Reflect.getMetadata(decorator, target);
  }

  public static decorateClass<TClass, TValue>(
    target: TypeOf<TClass>,
    decorator: MethodDecoratorFactory,
    value: TValue,
  ): void {
    Reflect.defineMetadata(decorator, target, value);
  }

  public static decorateMethod<TClass, TValue>(
    target: TClass,
    decorator: MethodDecoratorFactory,
    value: TValue,
    method: string,
  ): void {
    const oldMetadata: TValue[] = Reflect.getMetadata(decorator, target, method) ?? [];
    oldMetadata.push(value);
    Reflect.defineMetadata(decorator, oldMetadata, target, method);
  }

  public static getMethodDecorators<TClass, TValue>(
    target: TClass,
    decorator: MethodDecoratorFactory,
    method: string,
  ): TValue[] {
    return Reflect.getMetadata(decorator, target, method) ?? [];
  }

  private static readonly METADATA_PREFIX = 'metadata::' as const;

  public static setMetadata<TClass, TValue>(
    target: TypeOf<TClass>,
    key: string,
    value: TValue,
    method: string = undefined,
  ): void {
    Reflect.defineMetadata(this.METADATA_PREFIX + key, value, target, method);
  }

  public static hasMetadata<TClass>(target: TypeOf<TClass>, key: string, method: string = undefined): void {
    Reflect.hasMetadata(this.METADATA_PREFIX + key, target, method);
  }

  public static getMetadata<TClass, TValue>(target: TypeOf<TClass>, key: string, method: string = undefined): TValue {
    return Reflect.getMetadata(this.METADATA_PREFIX + key, target, method) as TValue;
  }

  public static extendMetadata<TClass, TValue>(
    target: TypeOf<TClass>,
    key: string,
    value: TValue,
    method: string = undefined,
  ): void {
    key = this.METADATA_PREFIX + key;
    const oldMetadata: TValue[] = Reflect.getMetadata(key, target, method) ?? [];
    oldMetadata.push(value);
    Reflect.defineMetadata(key, oldMetadata, target, method);
  }
}
