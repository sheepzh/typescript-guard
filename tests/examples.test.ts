import { describe, expect, it } from "vitest"
import { createArrayGuard, createObjectGuard, isNumber, isString, isUnknown, TypeGuard } from "../src"

type GenericExample<T> = {
    data: { data: T }[]
}

type AnotherGenericExample<T> = {
    data: { data: T }
}

describe('Generic Example', () => {
    it('should work with different types', () => {
        const stringExample = {
            data: [
                { data: 'hello' },
                { data: 'world' }
            ]
        }

        const numberExample = {
            data: [
                { data: 1 },
                { data: 2 }
            ]
        }

        const isGenericExample = <T,>(itemGuard: TypeGuard<T>) => createObjectGuard<GenericExample<T>>({
            data: createArrayGuard(createObjectGuard({ data: itemGuard }))
        })

        const isStringExample: TypeGuard<GenericExample<string>> = isGenericExample(isString)

        const isNumberExample: TypeGuard<GenericExample<number>> = createObjectGuard<GenericExample<number>>({
            data: createArrayGuard(
                createObjectGuard({
                    data: isNumber,
                })
            )
        })

        const isUnknownExample: TypeGuard<GenericExample<unknown>> = createObjectGuard<GenericExample<unknown>>({
            data: createArrayGuard(
                createObjectGuard({
                    data: isUnknown,
                })
            )
        })

        expect(isStringExample(stringExample)).toBe(true)
        expect(isStringExample(numberExample)).toBe(false)

        expect(isNumberExample(numberExample)).toBe(true)
        expect(isNumberExample(stringExample)).toBe(false)

        expect(isUnknownExample(stringExample)).toBe(true)
        expect(isUnknownExample(numberExample)).toBe(true)

        const isAnotherGenericStringExample = createObjectGuard<AnotherGenericExample<string>>({
            data: createObjectGuard({
                data: isString,
            })
        })
        expect(isAnotherGenericStringExample(stringExample)).toBe(false)
    })
})