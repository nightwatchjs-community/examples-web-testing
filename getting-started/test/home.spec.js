describe('Nighwatch homepage', function () {
  beforeEach(function (browser) {
    browser.window.maximize()
    browser.navigateTo('/')
  })
  afterEach(browser => browser.end())

  it('Should have the correct title', function(browser) {
    browser.element.find('h1').getText().assert.equals('Introducing Nightwatch v3')
  })

  it('Should lead to the installation page on click of Get Started', function (browser) {
    browser.element.findByText('Get Started').click()
    browser.element.findByPlaceholderText('Filter by title').waitUntil('visible')
    browser.element.find('h1').getText().assert.equals('Install Nightwatch')
    browser.assert.titleEquals('Getting Started | Developer Guide | Nightwatch.js')
    browser.assert.urlContains('nightwatchjs.org/guide/quickstarts')
    browser.element.findByPlaceholderText('Filter by title')
      .getAttribute('autocomplete').assert.equals('off')
    ;
  })

  it('Should allow search and show correct results', function (browser) {
    browser.element.find('#docsearch').click()
    browser.element.find('.DocSearch-Modal').waitUntil('visible')

    const search_input = browser.element.findByPlaceholderText('Search docs')
    search_input.sendKeys('frame')
    browser.element.find('.DocSearch-Dropdown-Container').assert.present()
    search_input.sendKeys([browser.Keys.ARROW_DOWN, browser.Keys.ENTER])

    browser.element.find('h1').getText().assert.contains('.frameParent')
  })

  it('Should copy the installation command on copy button click', function (browser) {
    const is_mac = browser.capabilities.platformName.toLowerCase().includes('mac')
    browser.element.findByText('Copy').click()
    browser.element.find('#docsearch').click()
    const $inputEl = browser.element.find('.DocSearch-Modal .DocSearch-Form input')
    $inputEl.sendKeys([is_mac ? browser.Keys.COMMAND : browser.Keys.CONTROL, 'v'])
    $inputEl.getAttribute('value').assert.contains('npm init nightwatch')
  })

  it('Should should change with client script', async function (browser) {
    const change_text = "{Client Side Execution}"
    browser.executeScript(function (new_text) {
      const $hero_cta = document.querySelector('.hero__action-button--get-started')
      $hero_cta.innerHTML = new_text
      $hero_cta.style.background = '#ff7f2b'
      document.querySelector('header .navigation-list').style.display = 'none'
      document.querySelector('header .navigation__logo').style.width = '900px'
    }, [change_text])
    browser.pause(1000) // Pausing just to notice the changes
    browser.element.findByText(change_text).click()
    browser.assert.titleMatches('Getting Started')
  })

  it('Should allow for substack subscription', function (browser) {
    const iframe_selector = '.footer__wrapper-inner-social-subscribe iframe'
    browser
      .executeScript(function (iframe_selector) {
        document.querySelector(iframe_selector).scrollIntoView()
      }, [iframe_selector])
    browser.element.find(iframe_selector).setAttribute('id', 'iframe-test-nightwatch')
    browser.frame('iframe-test-nightwatch')

    browser.element.find('input[type=email]').sendKeys('test@nightwatchjs.org')
    browser.element.find('button[type=submit]').click()

    browser.ensure.alertIsPresent()
    browser.alerts.accept()
    browser.element.findByText('Sign out').assert.present()
  })

  it('Should lead to the GitHub repo on clicking the Github icon', async function (browser) {
    browser.element.find('ul.navigation-list.social li:nth-child(2) a').click()
    // wait until window handle for the new window is available
    browser.waitUntil(async function () {
      const windowHandles = await browser.window.getAllHandles()
      return windowHandles.length === 2
    })

    const allWindows = await browser.window.getAllHandles()
    browser.window.switchTo(allWindows[1])

    browser.assert.urlContains('github.com/nightwatchjs')
  })

  it('sets and verifies the geolocation to Japan, USA and Denmark', function (browser) {
    const location_tests = [
      {
        location: { latitude: 35.689487, longitude: 139.691706, accuracy: 100 },
        // Tokyo Metropolitan Government Office, 都庁通り, Nishi - Shinjuku 2 - chome, Shinjuku, 163 - 8001, Japan
        test_text: 'Japan',
      },
      {
        location: { latitude: 40.730610, longitude: -73.935242, accuracy: 100 },
        // 38-20 Review Avenue, New York, NY 11101, United States of America
        test_text: 'New York',
      },
      {
        location: { latitude: 55.676098, longitude: 12.568337, accuracy: 100 },
        // unnamed road, 1550 København V, Denmark
        test_text: 'Denmark',
      }
    ]

    const waitTillLoad = async function () {
      const geo_dom_class = await browser.element.find('#geolocation_address')
        .getAttribute('class').value
      return !geo_dom_class.includes('text-muted')
    }

    location_tests.forEach(obj => {
      browser.setGeolocation(obj.location).navigateTo('https://www.where-am-i.co/')
      browser.waitUntil(waitTillLoad)
      browser.element.find('#geolocation_address').getText().assert.contains(obj.test_text)
    })
  })
})
