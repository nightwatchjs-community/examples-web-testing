describe('Nighwatch homepage', function () {
  beforeEach(async function (browser) {
    await browser.window.maximize()
    await browser.navigateTo('/')
  })
  afterEach(browser => browser.end())

  it('Should have the correct title', function(browser) {
    browser.assert.textEquals('h1', 'Introducing Nightwatch v3')
  })

  it('Should lead to the installation page on click of Get Started', async function(browser) {
    await browser.click(browser.element.findByText('Get Started'))
    browser.assert.titleEquals('Getting Started | Developer Guide | Nightwatch.js')
    browser.assert.equal(await browser.element.find('h1').getText(), 'Install Nightwatch')
    const $filter_el = await browser.element.findByPlaceholderText('Filter by title')
    browser.expect(await $filter_el.getAttribute('autocomplete')).to.equal('off')
    browser.assert.urlContains('nightwatchjs.org/guide/quickstarts')
  })

  it('Should allow search and show correct results', async function(browser) {
    await browser.click('#docsearch').waitForElementVisible('.DocSearch-Modal')
    const $search_input = browser.element.findByPlaceholderText('Search docs')
    await browser
      .sendKeys($search_input, 'click ')
      .pause(50) // Pausing for the JS tick
      .waitForElementPresent('.DocSearch-Dropdown-Container')
      .sendKeys($search_input, [browser.Keys.ARROW_DOWN, browser.Keys.ENTER])
      .assert.textContains('h1', '.rightClick()')
    ;
  })

  it('Should copy the installation command on copy button click', function (browser) {
    const input_selector = '.DocSearch-Modal .DocSearch-Form input'
    browser
      .click(browser.element.findByText('Copy'))
      .click('#docsearch')
      .sendKeys(input_selector, [browser.Keys.COMMAND, 'v', browser.Keys.NULL])
      .assert.attributeMatches(input_selector, 'value', 'npm init nightwatch')
    ;
  })

  it('Should should change with client script', async function (browser) {
    const change_text = "{Client Side Execution}"
    await browser.executeScript(function (new_text) {
      const $hero_cta = document.querySelector('.hero__action-button--get-started')
      $hero_cta.innerHTML = new_text
      $hero_cta.style.background = '#ff7f2b'
      document.querySelector('header .navigation-list').style.display = 'none'
      document.querySelector('header .navigation__logo').style.width = '900px'
    }, [change_text])
    await browser.pause(1000) // Pausing just to notice the changes
    await browser.click(browser.element.findByText(change_text))
    browser.assert.titleMatches('Getting Started')
  })

  it('Should allow for substack subscription', function (browser) {
    const iframe_selector = '.footer__wrapper-inner-social-subscribe iframe'
    browser
      .execute(function (iframe_selector) {
        document.querySelector(iframe_selector).scrollIntoView()
      }, [iframe_selector])
      .setAttribute(iframe_selector, 'id', 'test-nightwatch-123')
      .frame('test-nightwatch-123')
      .sendKeys('input[type=email]', 'test@nightwatchjs.org')
      .click('button[type=submit]')
      .ensure.alertIsPresent()
      .alerts.accept()
      .assert.elementPresent(browser.element.findByText('Sign out'))
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

    await browser.assert.urlContains('github.com/nightwatchjs')
  })
})
