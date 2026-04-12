import { describe, expect, it } from 'vitest'
import { createArrayGuard, createGuard, createObjectGuard, createOptionalGuard, createStringUnionGuard, createUnionGuard, isInt, isString } from '../src/index'

type Language = 'en' | 'fr' | 'de'

type Activity = {
    ts: number
    desc?: string
    count: number
}

type User = {
    id: number
    name: string
    tags: string[]
    languages?: Language[]
    activities: Activity[] | Activity
}

const isTag = createGuard<string>(t => isString(t) && /^[a-z_]+$/.test(t))

const isLanguage = createStringUnionGuard<Language>('en', 'fr', 'de')

const isActivity = createObjectGuard<Activity>({
    ts: isInt,
    desc: createOptionalGuard(isString),
    count: isInt
})

const isUser = createObjectGuard<User>({
    id: isInt,
    name: isString,
    tags: createArrayGuard(isTag),
    languages: createOptionalGuard(createArrayGuard(isLanguage)),
    activities: createUnionGuard(createArrayGuard(isActivity), isActivity),
})

describe('Type Guards', () => {
    it('should validate basic types', () => {
        expect(isString('hello')).toBe(true)
        expect(isInt(42)).toBe(true)
    })

    it('should validate Language union', () => {
        expect(isLanguage('en')).toBe(true)
        expect(isLanguage('fr')).toBe(true)
        expect(isLanguage('de')).toBe(true)
        expect(isLanguage('invalid')).toBe(false)
    })

    it('should validate Tag with custom guard', () => {
        expect(isTag('valid_tag')).toBe(true)
        expect(isTag('123')).toBe(false)
    })

    it('should validate Activity object', () => {
        expect(isActivity({ ts: 1000, count: 5 })).toBe(true)
        expect(isActivity({ ts: 1000, desc: 'test', count: 5 })).toBe(true)
        expect(isActivity({ ts: 'invalid', count: 5 })).toBe(false)
    })

    it('should validate User object', () => {
        expect(isUser({
            id: 1,
            name: 'John',
            tags: ['user_tag'],
            activities: { ts: 1000, count: 1 }
        })).toBe(true)

        expect(isUser({
            id: 1,
            name: 'John',
            tags: ['INVALID_TAG'],
            activities: { ts: 1000, count: 1 }
        })).toBe(false)

        expect(isUser({
            id: 1,
            name: 'John',
            tags: ['valid_tag'],
            activities: [{
                ts: 1.1/* Invalid ts */,
                count: 1
            }]
        })).toBe(false)
    })
})