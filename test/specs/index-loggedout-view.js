describe('index logout view', function() {
  beforeEach(function() {
    browser.get('http://localhost:3000/logout');
    browser.get('http://localhost:3000/');

    /*
    browser.wait(function() {
      var deferred = protractor.promise.defer();
      element(by.css('.loaded')).isPresent()
        .then(function (isPresent) {
          deferred.fulfill(!isPresent);
        });
      return deferred.promise;
    });
    */

  });

  it('should have three some login buttons', function() {
    expect(element.all(by.css('.signup-buttons a')).count()).toEqual(3);
  });

  it('should have username and password fields', function() {
    expect(element.all(by.css('form input')).count()).toEqual(2);
  });

  it('should have atleast one user on the userlist', function() {
    expect(element(by.repeater('user in users')).isPresent()).toEqual(true);
    expect(element.all(by.repeater('user in users')).count()).toBeGreaterThan(0);
  });

  it('should not have "my profile info" box', function() {
    expect(element.all(by.css('.my-profile-info-box')).count()).toEqual(0);
    expect(element(by.binding('mydata.username')).isPresent()).toEqual(false);
  });
});