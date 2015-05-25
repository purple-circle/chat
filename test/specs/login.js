describe('login view not logged in', function() {
  beforeEach(function() {
    browser.get('http://localhost:3000/logout');
    browser.get('http://localhost:3000/login');
  });

  it('should have "Sign in" in login button', function() {
    expect(element.all(by.css('button')).count()).toEqual(1);
    // Material ui uppercases button texts :D
    expect(element(by.css('button')).getText()).toEqual("SIGN IN");
  });

  it('should have "Sign up" link', function() {
    expect(element(by.css('form a[ui-sref="signup()"]')).isPresent()).toBe(true);
    expect(element(by.css('form a[ui-sref="signup()"]')).getAttribute('href')).toContain('/signup');
  });

  it('should have username and password fields', function() {
    expect(element.all(by.css('form input')).count()).toEqual(2);
    expect(element(by.model('login.username')).isPresent()).toBe(true);
    expect(element(by.model('login.password')).isPresent()).toBe(true);
  });

  it('should fail when given wrong user details', function() {
    element(by.model('login.username')).sendKeys('wrong-username');
    element(by.model('login.password')).sendKeys('wrong-password');

    var button = element(By.css('button'));
    button.click();

    expect(browser.getCurrentUrl()).toContain('/login/fail');
  });


  it('should login when given correct user details', function() {
    element(by.model('login.username')).sendKeys('test');
    element(by.model('login.password')).sendKeys('test');

    var button = element(By.css('button'));
    button.click();

    // TODO: this needs to be fixed
    expect(browser.getCurrentUrl()).toBe('http://localhost:3000/');
  });

});
