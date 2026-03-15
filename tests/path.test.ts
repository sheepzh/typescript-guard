import { afterEach, describe, expect, it, vi } from "vitest"
import { createObjectGuard, createOptionalGuard, isString } from "../src"

type ComplexObj = {
    name: string
    address: {
        country: string
        city: string
    }
    contact: {
        email: {
            main: string
            secondary?: string
        }
    }
}

const isComplexObj = createObjectGuard<ComplexObj>({
    name: isString,
    address: createObjectGuard({
        country: isString,
        city: isString
    }),
    contact: createObjectGuard({
        email: createObjectGuard({
            main: isString,
            secondary: createOptionalGuard(isString)
        })
    })
})


describe('Type Guards', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should log incorrect path', () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

        const demo = {
            name: 'John',
            address: {
                country: 'USA',
                city: 123 // Invalid type
            },
            contact: {
                email: {
                    main: '123@github.com',
                    secondary: 456 // Invalid type
                }
            }
        }

        expect(isComplexObj(demo)).toBe(false)
        expect(logSpy).toHaveBeenCalledTimes(1)
        expect(logSpy).toHaveBeenCalledWith('[$.address.city] Invalid value:', 123)
        expect(warnSpy).not.toHaveBeenCalled()
    })
})