describe('Nighwatch homepage', function () {
  beforeEach(browser => browser.navigateTo('/'))
  afterEach(browser => browser.end())

  it('Should have the correct title', function(browser) {
    browser.assert.textEquals('h1', 'Introducing Nightwatch v3')
  })

  it('Should lead to the installation page on click of Get Started', function(browser) {
    browser
      .click(browser.element.findByText('Get Started'))
      .assert.titleEquals('Getting Started | Developer Guide | Nightwatch.js')
      .assert.textEquals('h1', 'Install Nightwatch')
    ;
  })

  it('Should lead to the GitHub repo on clicking the Github icon', async function (browser) {
    await browser.click('ul.navigation-list.social li:nth-child(2) a')
    // wait until window handle for the new window is available
    await browser.waitUntil(async function () {
      return (await browser.window.getAllHandles()).length === 2
    })

    const allWindows = await browser.window.getAllHandles()
    await browser.window.switchTo(allWindows[1])

    await browser.assert.urlContains('https://github.com/nightwatchjs/')
  })

  it('Should copy the installation command on copy button click', function (browser) {
    browser
      .click(browser.element.findByText('Copy'))
      .click('#docsearch')
      .sendKeys('.DocSearch-Modal .DocSearch-Form input', [browser.Keys.COMMAND, 'v', browser.Keys.NULL])
      .assert.attributeMatches('.DocSearch-Modal .DocSearch-Form input', 'value', 'npm init nightwatch')
    ;
  })
})
