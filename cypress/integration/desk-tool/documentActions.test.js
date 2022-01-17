import {
  createUniqueDocument,
  DEFAULT_CONFIG,
  getTestId,
  DATASET_NAME,
  sanityClientConfig,
} from '../../helpers'

const TITLE = 'Document actions [Cypress]'
const ACTIONS = ['publish', 'unpublish', 'delete', 'duplicate', 'duplicate', 'discard-changes']

const documentActionPath = (action) =>
  `mutate/${DATASET_NAME}?tag=sanity.studio.document.${action}*`

const documentUri = (docId) => `/${DATASET_NAME}/desk/input-ci;documentActionsCi;${docId}`

const addDocumentTitle = () =>
  cy.get(getTestId('input-title')).find('input').type(TITLE).should('have.value', TITLE)

async function getDocumentUri() {
  const testDoc = await createUniqueDocument({_type: 'documentActionsCi'})
  return [testDoc?._id, documentUri(testDoc?._id)]
}

async function deleteDocument(payload) {
  return sanityClientConfig.delete(payload)
}

describe('@sanity/desk-tool: base document actions', DEFAULT_CONFIG, () => {
  let documentId
  let documentPath

  beforeEach(() => {
    // Delete all the documents already created
    cy.wrap(deleteDocument({query: `*[_type == "documentActionsCi"]`}))

    cy.wrap(getDocumentUri()).then(([id, path]) => {
      documentId = id
      documentPath = path
      cy.visit(path)
    })

    // Create aliases for each document action
    ACTIONS.forEach((action) =>
      cy.intercept({method: 'POST', url: `*/**/${documentActionPath(action)}`}).as(action)
    )
  })

  it('@sanity/desk-tool: publish document', () => {
    addDocumentTitle()

    cy.get(getTestId('action-Publish')).should('not.have.attr', 'disabled')
    cy.get(getTestId('action-Publish')).click()
    cy.wait('@publish')

    cy.get(getTestId('action-Publish')).should('have.attr', 'disabled')
  })

  it(`'@sanity/desk-tool: unpublish document`, () => {
    addDocumentTitle()

    // Publish the document before unpublishing it
    cy.get(getTestId('action-Publish')).click()
    cy.wait('@publish')

    cy.get(getTestId('action-menu-button')).click()
    cy.get(getTestId('action-Unpublish')).click()
    cy.get(getTestId('confirm-unpublish')).click()
    cy.wait('@unpublish')

    cy.get(getTestId('action-Publish')).should('not.have.attr', 'disabled')
  })

  it(`'@sanity/desk-tool: duplicate document`, () => {
    addDocumentTitle()

    cy.get(getTestId('action-menu-button')).click()
    cy.get(getTestId('action-Duplicate')).click()
    cy.wait('@duplicate')

    // Check if we are actually viewing the new document
    // and not the one created for this test
    cy.url().should('not.contain', documentId)
  })

  it(`'@sanity/desk-tool: delete document`, () => {
    addDocumentTitle()

    cy.get(getTestId('action-menu-button')).click()
    cy.get(getTestId('action-Delete')).click()
    cy.get(getTestId('confirm-delete')).click()
    cy.wait('@delete')

    cy.get(getTestId('pane-content')).within((pane) => {
      cy.get(`a[href*="${documentPath}"]`).should('not.exist')
    })
  })

  it(`'@sanity/desk-tool: discard changes`, () => {
    addDocumentTitle()

    // Publish the document in order to discard changes
    cy.get(getTestId('action-Publish')).click()
    cy.wait('@publish')

    // Make a change to the document
    cy.get(getTestId('input-title')).find('input').type('123')

    cy.get(getTestId('action-menu-button')).click()
    cy.get(getTestId('action-Discardchanges')).click()
    cy.get(getTestId('confirm-discard-changes')).click()
    cy.wait('@discard-changes')

    cy.get(getTestId('input-title')).find('input').should('have.value', TITLE)
  })
})
