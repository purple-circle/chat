describe('index loggedin view', function() {
  beforeEach(function() {
    browser.get('http://localhost:3000/logout');
    browser.get('http://localhost:3000/login');
    element(by.model('login.username')).sendKeys('test');
    element(by.model('login.password')).sendKeys('test');

    var button = element(By.id('login-button'));
    button.click();

    browser.get('http://localhost:3000/');
  });

  afterEach(function() {
    browser.get('http://localhost:3000/logout');
  });

  it('should have three some login buttons', function() {
    expect(element.all(by.css('.signup-buttons a')).count()).toEqual(0);
  });

  it('should have username and password fields', function() {
    expect(element.all(by.css('form input')).count()).toEqual(0);
  });

  it('should have atleast one user on the userlist', function() {
    expect(element.all(by.repeater('user in users')).count()).toBeGreaterThan(0);
  });

  it('should say loggedin true', function() {
    expect(element(by.binding('loggedin')).getText()).toEqual("i'm logged in: true");
  });

  it('should have "my profile info" box', function() {
    expect(element.all(by.css('.my-profile-info-box')).count()).toEqual(1);
    expect(element(by.binding('mydata.username')).getText()).toEqual("test");
  });

});