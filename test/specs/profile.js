ddescribe('profile view', function() {
  beforeEach(function() {
    browser.get('http://localhost:3000/');

    var profiles = element.all(by.repeater('user in users'));
    var profile_link = profiles.get(0).element(by.css("a"));

    profile_link.click();

    /* // This seems not to be working properly
    browser.wait(function() {
      var deferred = protractor.promise.defer();
      element(by.css('p.username')).isPresent()
        .then(function (isPresent) {
          deferred.fulfill(!isPresent);
        });
      return deferred.promise;
    });
    */
  });

  var click_loggedin_profile = function() {
    var profile_link = element(by.css("a.loggedin-profile-link"));
    profile_link.click();
  };

  var login = function() {
    browser.get('http://localhost:3000/logout');
    browser.get('http://localhost:3000/login');
    element(by.model('login.username')).sendKeys('test');
    element(by.model('login.password')).sendKeys('test');

    var button = element(By.id('login-button'));

    // This might fail if test account hasn't created latest group
    return button
      .click()
      .then(click_loggedin_profile);
  };

  it('should have username visible', function() {
    expect(element(by.css('.username')).isPresent()).toBe(true);
  });
  it('should have birthday visible', function() {
    expect(element(by.css('.birthday-cake')).isPresent()).toBe(true);
  });
  it('should have join date visible', function() {
    expect(element(by.css('.created-date')).isPresent()).toBe(true);
  });
  it('should have cover image', function() {
    expect(element(by.css('.profile-cover')).isPresent()).toBe(true);
  });

  it('should have profile picture', function() {
    expect(element(by.css('.cover-picture-thumbnail')).isPresent()).toBe(true);
  });

  it('should have edit link', function() {
    login()
      .then(function() {
        expect(element(by.css('.edit-profile')).isPresent()).toBe(true);
        expect(element(by.css('.edit-profile')).getText()).toEqual("Edit profile");
      });
  });

});