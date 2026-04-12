/**
 * Type guard utilities for runtime type checking and validation.
 * 
 * This module provides a comprehensive set of type guards for validating
 * unknown data structures at runtime, ensuring type safety when working
 * with external APIs and user input.
 */

import type { TypeGuard } from "./types"

/**
 * Helper type that transforms an object type into a structure where each property
 * is a TypeGuard for that property's type.
 * 
 * This is used internally by `createObjectGuard` to ensure type safety when
 * defining object guards.
 * 
 * @template T - The object type to transform
 */
type GuardMapFor<T extends object> = {
    [K in keyof T]-?: T[K] extends (infer E)[] ? TypeGuard<T[K]> | TypeGuard<E> : TypeGuard<T[K]>
}

type InternalObjectGuard<T> = TypeGuard<T> & {
    __validateAtPath?: (value: unknown, path: string) => value is T
}

type NormalizeOptionalProps<T extends object> = {
    [K in keyof T as {} extends Pick<T, K> ? never : [undefined] extends [T[K]] ? [unknown] extends [T[K]] ? K : never : K]: T[K]
} & {
    [K in keyof T as {} extends Pick<T, K> ? K : [undefined] extends [T[K]] ? [unknown] extends [T[K]] ? never : K : never]?: Exclude<T[K], undefined>
}

/**
 * Creates a type guard from a custom type checking function.
 * 
 * @template T - The type to guard against
 * 
 * @param typeCheck - A function that returns true if the value matches type T
 * @returns A TypeGuard function for type T
 * 
 * @example
 * ```typescript
 * const isPositive = createTypeGuard<number>(
 *   (value) => typeof value === 'number' && value > 0
 * );
 * ```
 */
export function createGuard<T>(typeCheck: (value: unknown) => boolean): TypeGuard<T> {
    return (value: unknown): value is T => typeCheck(value)
}

/**
 * Creates a type guard for the undefined type.
 * 
 * @returns A TypeGuard that checks if a value is undefined
 */
export function createUndefinedGuard(): TypeGuard<undefined> {
    return (value: unknown): value is undefined => value === undefined
}

/**
 * Type guard for string values.
 */
export const isString = createGuard<string>(
    (value): value is string => typeof value === 'string'
)

/**
 * Type guard for number values (including NaN and Infinity).
 */
export const isNumber = createGuard<number>(
    (value): value is number => typeof value === 'number'
)

/**
 * Type guard for safe integer values.
 * 
 * Checks that the value is a number and within the safe integer range
 * (Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER).
 */
export const isInt = createGuard<number>(
    (value): value is number => Number.isSafeInteger(value)
)

/**
 * Type guard for boolean values.
 */
export const isBoolean = createGuard<boolean>(
    (value): value is boolean => typeof value === 'boolean'
)

/**
 * Type guard for undefined values.
 */
export const isUndefined = createUndefinedGuard()

/**
 * Type guard for null values.
 */
export const isNull = createGuard<null>(
    (value): value is null => value === null
)

/**
 * Type guard that accepts any value (always returns true).
 * 
 * Useful for optional fields that can contain any type of data.
 */
export const isUnknown = createGuard<unknown>(
    (_value): _value is unknown => true
)

/**
 * Creates a type guard for a specific literal value.
 * 
 * @template T - The literal type (string, number, boolean, or undefined)
 * @param expected - The exact value to match
 * @returns A TypeGuard that checks if a value equals the expected literal
 * 
 * @example
 * ```typescript
 * const isTrue = createLiteralGuard(true);
 * const isStatus = createLiteralGuard('active' as const);
 * ```
 */
export function createLiteralGuard<T extends string | number | boolean | undefined>(expected: T): TypeGuard<T> {
    return createGuard<T>((value) => value === expected)
}

/**
 * Creates a type guard for arrays of a specific type.
 * 
 * @template T - The type of array elements
 * @param itemGuard - The type guard to use for each array element
 * @returns A TypeGuard that checks if a value is an array where all elements match type T
 * 
 * @example
 * ```typescript
 * const isStringArray = createArrayGuard(isString);
 * const isUserArray = createArrayGuard(isUser);
 * ```
 */
export function createArrayGuard<T>(itemGuard: TypeGuard<T>): TypeGuard<T[]> {
    return createGuard<T[]>(
        (value): value is T[] => Array.isArray(value) && value.every(item => itemGuard(item))
    )
}

/**
 * Type guard for arrays of strings.
 */
export const isStringArray = createArrayGuard(isString)

/**
 * Creates a type guard for a union of string literal types.
 * 
 * @template T - The string literal union type
 * @param values - The valid string values to match
 * @returns A TypeGuard that checks if a value is one of the provided string literals
 * 
 * @example
 * ```typescript
 * type Status = 'pending' | 'active' | 'inactive';
 * const isStatus = createStringUnionGuard<Status>('pending', 'active', 'inactive');
 * ```
 */
export function createStringUnionGuard<T extends string>(...values: T[]): TypeGuard<T> {
    const validValues = new Set<T>(values)
    return (value: unknown): value is T => {
        return typeof value === 'string' && validValues.has(value as T)
    }
}

/**
 * Creates a type guard for a union of number literal types.
 * 
 * @template T - The number literal union type
 * @param values - The valid number values to match
 * @returns A TypeGuard that checks if a value is one of the provided number literals
 * 
 * @example
 * ```typescript
 * type Code = 200 | 404 | 500;
 * const isCode = createNumberUnionGuard<Code>(200, 404, 500);
 * ```
 */
export function createNumberUnionGuard<T extends number>(...values: T[]): TypeGuard<T> {
    const validValues = new Set<T>(values)
    return (value: unknown): value is T => {
        return typeof value === 'number' && validValues.has(value as T)
    }
}

/**
 * Creates a type guard for a union type from multiple type guards.
 * 
 * @template T - Tuple type representing the union (e.g., [string, number])
 * @param guards - Type guards for each type in the union
 * @returns A TypeGuard that checks if a value matches any of the provided types
 * 
 * @example
 * ```typescript
 * const isStringOrNumber = createUnionGuard(isString, isNumber);
 * ```
 */
export function createUnionGuard<T extends any[]>(
    ...guards: { [K in keyof T]: TypeGuard<T[K]> }
): TypeGuard<T[number]> {
    return (value: unknown): value is T[number] => {
        return guards.some(guard => guard(value))
    }
}

/**
 * Combines two type guards to create a guard for an intersection type.
 * 
 * @template T1 - The first type
 * @template T2 - The second type
 * @param guard1 - Type guard for T1
 * @param guard2 - Type guard for T2
 * @returns A TypeGuard that checks if a value matches both T1 and T2
 * 
 * @example
 * ```typescript
 * const isUserWithEmail = mergeGuards(isUser, isEmail);
 * ```
 */
export function mergeGuards<T1, T2>(
    guard1: TypeGuard<T1>,
    guard2: TypeGuard<T2>,
): TypeGuard<T1 & T2> {
    return (x: unknown): x is T1 & T2 => guard1(x) && guard2(x)
}

/**
 * Creates a type guard for an optional type (T | undefined).
 * 
 * @template T - The base type
 * @param guard - Type guard for type T
 * @returns A TypeGuard that checks if a value is undefined or matches type T
 * 
 * @example
 * ```typescript
 * const isOptionalString = createOptionalGuard(isString);
 * ```
 */
export function createOptionalGuard<T>(guard: TypeGuard<T>): TypeGuard<T | undefined> {
    return (value: unknown): value is T | undefined => {
        return value === undefined || guard(value)
    }
}

/**
 * Creates a type guard for a nullable type (T | null).
 * 
 * @template T - The base type
 * @param guard - Type guard for type T
 * @returns A TypeGuard that checks if a value is null or matches type T
 * @example
 * ```typescript
 * const isNullableNumber = createNullableGuard(isNumber);
 * ```
 */
export function createNullableGuard<T>(guard: TypeGuard<T>): TypeGuard<T | null> {
    return (value: unknown): value is T | null => {
        return value === null || guard(value)
    }
}

/**
 * Creates a type guard for an object type based on property guards.
 * 
 * @template T - The object type to guard against
 * @param guards - An object where each property is a TypeGuard for the corresponding property in T
 * @returns A TypeGuard that validates an object matches type T
 * 
 * @remarks
 * The guards parameter should have the same structure as the target type T,
 * with each property being a TypeGuard for that property's type.
 * 
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   age: number;
 * }
 * 
 * const isUser = createObjectGuard<User>({
 *   id: isString,
 *   name: isString,
 *   age: isInt,
 * });
 * ```
 */
export function createObjectGuard<T extends object>(
    guards: GuardMapFor<T>
): TypeGuard<NormalizeOptionalProps<T>> {
    const validateAtPath = wrapObjectGuard<NormalizeOptionalProps<T>>(guards)
    const guard: InternalObjectGuard<NormalizeOptionalProps<T>> =
        ((value: unknown): value is NormalizeOptionalProps<T> => validateAtPath(value, '$'))
    guard.__validateAtPath = validateAtPath
    return guard
}

function wrapObjectGuard<T extends object>(
    guards: Record<string, TypeGuard<any>>,
): (value: unknown, path: string) => value is T {
    return (value: unknown, path: string): value is T => {
        if (typeof value !== 'object' || value === null) {
            console.warn(`[${path}] Invalid object: `, value)
            return false
        }

        for (const key in guards) {
            const guard = guards[key]
            if (typeof guard !== 'function') {
                console.warn(`[${path}.${key}] Guard is not callable`)
                return false
            }
            const guardTarget = (value as any)?.[key]
            const nestedGuard = guard as InternalObjectGuard<any>
            const currentPath = `${path}.${key}`
            let isValid: boolean
            if (nestedGuard.__validateAtPath) {
                if (Array.isArray(guardTarget)) {
                    isValid = guardTarget.every((item: unknown, i: number) =>
                        nestedGuard.__validateAtPath!(item, `${currentPath}[${i}]`)
                    )
                } else {
                    isValid = nestedGuard.__validateAtPath(guardTarget, currentPath)
                }
            } else {
                isValid = guard(guardTarget)
            }
            if (!isValid) {
                if (nestedGuard.__validateAtPath) {
                    // Nested object guard has already logged the detailed path.
                    return false
                }
                console.log(`[${currentPath}] Invalid value:`, guardTarget)
                return false
            }
        }
        return true
    }
}

/**
 * Creates a type guard for a Record (object with string keys and values of type T).
 * 
 * @template T - The type of values in the record
 * @param valueGuard - Type guard for the record values
 * @returns A TypeGuard that checks if a value is a Record<string, T>
 * 
 * @example
 * ```typescript
 * const isStringRecord = createRecordGuard(isString);
 * // Validates: { [key: string]: string }
 * ```
 */
export function createRecordGuard<T>(valueGuard: TypeGuard<T>): TypeGuard<Record<string, T>> {
    return createGuard<Record<string, T>>(
        (value): value is Record<string, T> => {
            if (typeof value !== 'object' || value === null) return false
            for (const key in value as Record<string, unknown>) {
                if (!valueGuard((value as Record<string, unknown>)[key])) {
                    return false
                }
            }
            return true
        })
}

export * from "./assert"
export * from "./types"

