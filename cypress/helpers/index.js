export * from './constants'
export * from './createUniqueDocument'
export {default as sanityClientConfig} from './sanityClientSetUp'

export const getTestId = (name) => `[data-testid="${name}"]`
