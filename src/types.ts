/**
 * A type guard function that checks if a value matches a specific type.
 * 
 * @template T - The type to guard against
 * 
 * @param value - The value to check
 * @param ignoreErr - Optional flag to suppress error logging during validation
 * @returns True if the value matches type T, false otherwise
 * 
 * @remarks
 * The `__invariant_in` and `__invariant_out` properties are internal
 * markers used by TypeScript for type narrowing and are not meant
 * to be accessed directly.
 */
export type TypeGuard<T> = {
    (value: unknown): value is T
    readonly __invariant_in?: (value: T) => void
    readonly __invariant_out?: () => T
}

