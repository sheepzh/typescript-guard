import { TypeGuard } from "./types"

/**
 * Asserts that a value is not undefined.
 * 
 * @template T - The base type
 * @param value - The value to check
 * @param message - Optional error message
 */
export function assertNotUndefined<T>(value: T | undefined, message?: string): T {
    if (value === undefined) {
        throw new Error(message || "Value is undefined")
    }
    return value
}

/**
 * Asserts that a value is neither null nor undefined.
 * 
 * @template T - The base type
 * @param value - The value to check
 * @param message - Optional error message
 */
export function assertNotNullNorUndefined<T>(value: T | null | undefined, message?: string): T {
    if (value === null || value === undefined) {
        throw new Error(message || "Value is null or undefined")
    }
    return value
}


/**
 * Asserts that a value is not null.
 * 
 * @template T - The base type
 * @param value - The value to check
 * @param message - Optional error message
 */
export function assertNotNull<T>(value: T | null, message?: string): T {
    if (value === null) {
        throw new Error(message || "Value is null")
    }
    return value
}

/**
 * Asserts that a value matches a specific type, throwing an error if validation fails.
 * 
 * @overload
 * @template T - The expected type
 * @param value - The value to validate
 * @param guard - The type guard function to use for validation
 * @returns The validated value of type T
 * @throws {Error} If validation fails and no default value is provided
 * 
 * @overload
 * @template T - The expected type
 * @param value - The value to validate
 * @param guard - The type guard function to use for validation
 * @param defaultValue - Default value to return if validation fails
 * @returns The validated value of type T, or the default value if validation fails
 * 
 * @overload
 * @template T - The expected type
 * @param value - The value to validate
 * @param guard - The type guard function to use for validation
 * @param defaultValue - null to allow null return
 * @returns The validated value of type T, or null if validation fails
 * 
 * @example
 * ```typescript
 * const data = await api.get('/user');
 * const user = assertType(data, isUser); // Throws if invalid
 * 
 * const maybeUser = assertType(data, isUser, null); // Returns null if invalid
 * const userWithDefault = assertType(data, isUser, defaultUser); // Returns default if invalid
 * ```
 */
export function assertType<T>(value: unknown, guard: TypeGuard<T>): T
export function assertType<T>(value: unknown, guard: TypeGuard<T>, defaultValue: T): T
export function assertType<T>(value: unknown, guard: TypeGuard<T>, defaultValue: null): T | null
export function assertType<T>(value: unknown, guard: TypeGuard<T>, defaultValue?: T): T | null {
    if (guard(value)) {
        return value
    } else if (value === null) {
        return null
    } else if (defaultValue !== undefined) {
        return defaultValue
    } else {
        throw new Error('Type assertion failed')
    }
}