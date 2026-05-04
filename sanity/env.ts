export const apiVersion = '2026-03-10'
export const dataset = 'mieszkanie'
export const projectId = '9q753gf2'

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
