describe('group view', function() {

  var click_latest_group = function() {
    browser.get('http://localhost:3000/groups');
    var groups = element.all(by.repeater('group in groups'));
    var group_link = groups.get(0).element(by.css("a.group-link"));
    group_link.click();
  };

  beforeEach(function() {
    click_latest_group();

    // This seems to leave the browser hanging
    /*
    browser.wait(function() {
      var deferred = protractor.promise.defer();
      element(by.css('.group-name')).isPresent()
        .then(function (isPresent) {
          deferred.fulfill(isPresent);
        });
      return deferred.promise;
    });
    */

  });

  var login = function() {
    browser.get('http://localhost:3000/logout');
    browser.get('http://localhost:3000/login');
    element(by.model('login.username')).sendKeys('test');
    element(by.model('login.password')).sendKeys('test');

    var button = element(By.id('login-button'));

    // This might fail if test account hasn't created latest group
    button
      .click()
      .then(click_latest_group);
  };

  it('should have group name visible', function() {
    expect(element(by.binding('group.name')).isPresent()).toBe(true);
  });

  it('should have user who created the group visible', function() {
    expect(element(by.binding('created_by.name')).isPresent()).toBe(true);
  });

  it('should have description', function() {
    expect(element(by.binding('group.description')).isPresent()).toBe(true);
  });

  it('should have created date visible', function() {
    expect(element(by.binding('group.created')).isPresent()).toBe(true);
  });

  it('should have category visible', function() {
    expect(element(by.binding('group.category')).isPresent()).toBe(true);
  });

  it('should not have edit link visible', function() {
    expect(element(by.css('.group-edit')).isPresent()).toBe(false);
  });

  it('should have edit link visible', function() {
    login()
    expect(element(by.css('.group-edit')).isPresent()).toBe(true);
  });

  it('should have edit link with text "edit"', function() {
    login()
    expect(element(by.css('.group-edit')).isPresent()).toBe(true);
    expect(element(by.css('.group-edit')).getText()).toBe("Edit");
  });

  it('should save group edit', function() {
    login()
    expect(element(by.css('.group-edit')).isPresent()).toBe(true);
    expect(element(by.css('.group-edit')).getText()).toBe("Edit");

    var edit_button = element(by.css('.group-edit'))
    edit_button.click();

    // Maybe unnecessary duplication :D
    //expect(browser.getCurrentUrl()).not.toBe('http://localhost:3000/group/5461196563bef400007fb48d');
    //expect(browser.getCurrentUrl()).toBe('http://localhost:3000/group/5461196563bef400007fb48d/edit');

    var new_description = "juhq puhq " + Math.random();

    var description_model = element(by.model('data.description'));
    description_model.clear();

    description_model.sendKeys(new_description);
    var save_button = element(by.css('.save-group'))

    expect(save_button.isPresent()).toBe(true);
    expect(save_button.getText()).toBe("SAVE EDIT");

    save_button.click();

    // Maybe unnecessary duplication :D
    //expect(browser.getCurrentUrl()).not.toBe('http://localhost:3000/group/5461196563bef400007fb48d/edit');
    //expect(browser.getCurrentUrl()).toBe('http://localhost:3000/group/5461196563bef400007fb48d');

    expect(element(by.binding('group.description')).isPresent()).toBe(true);
    expect(element(by.binding('group.description')).getText()).toBe(new_description);

  });

});