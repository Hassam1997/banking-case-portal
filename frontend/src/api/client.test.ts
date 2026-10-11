import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { errorMessage } from './client'

function httpError(status: number, data: unknown = {}) {
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status, data, statusText: '', headers: {}, config: {} as never,
  })
}

describe('errorMessage', () => {
  it('prefers the message sent by the API', () => {
    expect(errorMessage(httpError(400, { message: 'title must not be blank' }))).toBe('title must not be blank')
  })
  it('explains a 403', () => {
    expect(errorMessage(httpError(403))).toMatch(/permission/i)
  })
  it('explains an unreachable server', () => {
    expect(errorMessage(new AxiosError('Network Error'))).toMatch(/cannot reach/i)
  })
})