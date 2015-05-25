(function() {
  'use strict';
  var app, secondsOnSite;

  app = angular.module('app', ['ui.router', 'ui.router.compat', 'templates', 'ngMaterial', 'youtube-embed', 'ngSanitize', 'batteryLevel', 'luegg.directives']);

  app.config(["$stateProvider", "$locationProvider", function($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    return $stateProvider.state('index', {
      url: '/',
      templateUrl: 'index.html',
      controller: 'index'
    });
  }]);

  app.run(["$rootScope", function($rootScope) {
    $rootScope.page_title = "(><)";
    return $rootScope.$on('$stateChangeStart', function(event, toState) {
      return ga('send', 'pageview', toState.url);
    });
  }]);

  secondsOnSite = 0;

  setInterval(function() {
    return secondsOnSite++;
  }, 1000);

  window.onbeforeunload = function() {
    return ga('send', 'event', 'timeSpentOnChat', 'seconds', secondsOnSite);
  };

  window.onerror = function(msg, url, line, col, orig_error) {
    var error;
    if (!JSON) {
      return false;
    }
    error = {
      msg: msg,
      url: url,
      line: line,
      col: col,
      error: orig_error
    };
    return ga('send', 'event', 'error', orig_error, JSON.stringify(error));
  };

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.controller('GridBottomSheetCtrl', ["$scope", "$mdBottomSheet", function($scope, $mdBottomSheet) {
    $scope.items = [
      {
        name: 'Yolo',
        icon: 'twitter'
      }
    ];
    return $scope.listItemClick = function($index) {
      var clickedItem;
      clickedItem = $scope.items[$index];
      $mdBottomSheet.hide(clickedItem);
      return console.log("clickedItem", clickedItem);
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.controller('index', ["$rootScope", "$scope", function($rootScope, $scope) {
    return $rootScope.page_title = "Home";
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive("messages", ["$rootScope", "$timeout", "$interval", "$mdSidenav", "$mdBottomSheet", "$mdMedia", "api", function($rootScope, $timeout, $interval, $mdSidenav, $mdBottomSheet, $mdMedia, api) {
    return {
      templateUrl: "directives/chat/messages.html",
      scope: {
        group: "=",
        chatId: "="
      },
      link: function($scope) {
        var getMessages, hashCode, intToARGB, listenToMessages, processMessage, processMessages;
        $scope.room_id = 1;
        $scope.messages = {};
        $scope.whitespaces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        $scope.youtubeOptions = {
          autoplay: true
        };
        hashCode = function(str) {
          var hash, i;
          hash = 0;
          i = 0;
          while (i < str.length) {
            hash = str.charCodeAt(i) + (hash << 5) - hash;
            i++;
          }
          return hash;
        };
        intToARGB = function(i) {
          var h;
          h = (i >> 24 & 0xFF).toString(16) + (i >> 16 & 0xFF).toString(16) + (i >> 8 & 0xFF).toString(16) + (i & 0xFF).toString(16);
          return h.substring(0, 6);
        };
        $scope.openYoutubeVideo = function(item) {
          return item.videoOpened = true;
        };
        processMessage = function(row) {
          var data, hasYoutubeUrl, possibleUrl, youtubeId;
          hasYoutubeUrl = api.isYoutubeUrl(row.original_message);
          if (hasYoutubeUrl) {
            youtubeId = api.getYoutubeIdFromUrl(row.original_message);
          }
          possibleUrl = api.stringHasUrl(row.original_message);
          if ((possibleUrl != null ? possibleUrl[0] : void 0) && api.urlIsImage(possibleUrl[0])) {
            api.testImage(possibleUrl[0], function() {
              var j, len, message, ref, results;
              ref = $scope.messages[row.room_id];
              results = [];
              for (j = 0, len = ref.length; j < len; j++) {
                message = ref[j];
                if (message._id === row._id) {
                  results.push(message.hasImage = possibleUrl[0]);
                }
              }
              return results;
            });
          }
          data = {
            _id: row._id,
            hasImage: false,
            room_id: row.room_id,
            message: row.message,
            createdAt: row.created_at,
            from: row.from,
            is_me: row.sid === yolosid,
            color: intToARGB(hashCode(row.from)),
            youtubeId: youtubeId
          };
          if (!$scope.messages[row.room_id]) {
            $scope.messages[row.room_id] = [];
          }
          return $scope.messages[row.room_id].push(data);
        };
        processMessages = function(messages) {
          var j, len, message, results;
          results = [];
          for (j = 0, len = messages.length; j < len; j++) {
            message = messages[j];
            results.push(processMessage(message));
          }
          return results;
        };
        getMessages = function() {
          ga('send', 'event', 'messages', 'getMessages', $scope.chatId, $scope.room_id);
          return api.load_chat_messages($scope.chatId).then(processMessages);
        };
        listenToMessages = function() {
          return api.socket.on("save_chat_message", function(message) {
            processMessage(message);
            return $rootScope.$broadcast("message-notification", message.room_id);
          });
        };
        getMessages();
        listenToMessages();
        return $scope.showGridBottomSheet = function($event) {
          return $mdBottomSheet.show({
            templateUrl: 'directives/chat/bottom-sheet.html',
            controller: 'GridBottomSheetCtrl',
            targetEvent: $event
          });
        };
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive("chat", ["$rootScope", "$timeout", "$mdSidenav", "$mdBottomSheet", "$mdMedia", "api", "animals", function($rootScope, $timeout, $mdSidenav, $mdBottomSheet, $mdMedia, api, animals) {
    return {
      templateUrl: "directives/chat/chat.html",
      link: function($scope) {
        var createMessage, getGroups, listenToMessageNotifications;
        $scope.chat_id = "chat-123";
        $scope.room_id = 1;
        $scope.groups = [];
        $scope.users = [];
        $scope.message = '';
        $scope.currentUser = false;
        $scope.currentGroup = false;
        $scope.setActiveGroup = function(group) {
          var g, i, len, ref;
          group.messages = 0;
          $scope.currentGroup = group;
          ref = $scope.groups;
          for (i = 0, len = ref.length; i < len; i++) {
            g = ref[i];
            if (g.$selected === true) {
              g.$selected = false;
            }
          }
          group.$selected = true;
          $scope.room_id = group.room_id;
          return ga('send', 'event', 'groups', 'setActiveGroup', group.name, group.room_id);
        };
        listenToMessageNotifications = function() {
          return $rootScope.$on("message-notification", function(event, room_id) {
            var g, i, len, ref, results;
            ref = $scope.groups;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              g = ref[i];
              if (g.$selected !== true) {
                if (g.room_id === room_id) {
                  results.push(g.messages++);
                } else {
                  results.push(void 0);
                }
              }
            }
            return results;
          });
        };
        listenToMessageNotifications();
        $scope.from = (animals.getRandom()) + "-" + (Math.ceil(Math.random() * 100));
        ga('send', 'event', 'usernames', 'randomName', $scope.from);
        getGroups = function() {
          $scope.groups = [
            {
              room_id: 1,
              name: "Room #1",
              messages: 0,
              icon: 'http://i.imgur.com/h18WTm2b.jpg'
            }, {
              room_id: 2,
              name: "Room #2",
              messages: 0,
              icon: 'http://i.imgur.com/p8SNOcVb.jpg'
            }, {
              room_id: 3,
              name: "Room #666",
              messages: 0,
              icon: 'http://i.imgur.com/CfmbeXib.jpg'
            }
          ];
          return $scope.setActiveGroup($scope.groups[0]);
        };
        createMessage = function(data) {
          if (!data.message) {
            return;
          }
          data.room_id = $scope.room_id;
          data.chat_id = $scope.chat_id;
          return api.save_chat_messages(data);
        };
        getGroups();
        $scope.createGroup = function() {
          var data;
          if (!$scope.groupName) {
            return;
          }
          return data = {
            name: $scope.groupName,
            created_by: $scope.currentUser
          };
        };
        $scope.toggleTimeSpent = function() {
          return $scope.showTimeSpent = !$scope.showTimeSpent;
        };
        $scope.saveMessage = function() {
          var data;
          if (!$scope.message) {
            ga('send', 'event', 'messages', 'empty saveMessage', $scope.room_id);
            return;
          }
          ga('send', 'event', 'messages', 'saveMessage', $scope.room_id);
          data = {
            chat_id: $scope.chat_id,
            room_id: $scope.room_id,
            message: $scope.message,
            from: $scope.from,
            sid: yolosid
          };
          $scope.message = '';
          return createMessage(data);
        };
        $scope.toggleLeft = function() {
          return $mdSidenav('left').toggle();
        };
        return $scope.closeLeft = function() {
          return $mdSidenav('left').close();
        };
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('clock', ["dateFilter", "$timeout", function(dateFilter, $timeout) {
    return {
      restrict: 'E',
      scope: {
        format: '@'
      },
      link: function($scope, element, attrs) {
        var updateTime;
        updateTime = function() {
          var now;
          now = Date.now();
          element.html(dateFilter(now, $scope.format));
          return $timeout(updateTime, now % 1000);
        };
        return updateTime();
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('onlineCount', ["$timeout", "api", function($timeout, api) {
    return {
      restrict: 'E',
      scope: {
        chatid: '@'
      },
      link: function($scope, element, attrs) {
        api.get_online_count();
        return api.socket.on("get_online_count", function(result) {
          return element.html(result);
        });
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.filter("newlines", function() {
    return function(text) {
      return text.replace(/\n/g, "<br>");
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module("app");

  app.service("animals", function() {
    var animals;
    animals = ["Abyssinian", "Affenpinscher", "Akbash", "Akita", "Albatross", "Alligator", "Angelfish", "Ant", "Anteater", "Antelope", "Armadillo", "Avocet", "Axolotl", "Baboon", "Badger", "Balinese", "Bandicoot", "Barb", "Barnacle", "Barracuda", "Bat", "Beagle", "Bear", "Beaver", "Beetle", "Binturong", "Bird", "Birman", "Bison", "Bloodhound", "Bobcat", "Bombay", "Bongo", "Bonobo", "Booby", "Budgerigar", "Buffalo", "Bulldog", "Bullfrog", "Burmese", "Butterfly", "Caiman", "Camel", "Capybara", "Caracal", "Cassowary", "Cat", "Caterpillar", "Catfish", "Centipede", "Chameleon", "Chamois", "Cheetah", "Chicken", "Chihuahua", "Chimpanzee", "Chinchilla", "Chinook", "Chipmunk", "Cichlid", "Coati", "Cockroach", "Collie", "Coral", "Cougar", "Cow", "Coyote", "Crab", "Crane", "Crocodile", "Cuscus", "Cuttlefish", "Dachshund", "Dalmatian", "Deer", "Dhole", "Dingo", "Discus", "Dodo", "Dog", "Dolphin", "Donkey", "Dormouse", "Dragonfly", "Drever", "Duck", "Dugong", "Dunker", "Eagle", "Earwig", "Echidna", "Elephant", "Emu", "Falcon", "Ferret", "Fish", "Flamingo", "Flounder", "Fly", "Fossa", "Fox", "Frigatebird", "Frog", "Gar", "Gecko", "Gerbil", "Gharial", "Gibbon", "Giraffe", "Goat", "Goose", "Gopher", "Gorilla", "Grasshopper", "Eater", "Greyhound", "Grouse", "Guppy", "Hamster", "Hare", "Harrier", "Havanese", "Hedgehog", "Heron", "Himalayan", "Hippopotamus", "Horse", "Human", "Hummingbird", "Hyena", "Ibis", "Iguana", "Impala", "Indri", "Insect", "Jackal", "Jaguar", "Javanese", "Jellyfish", "Kakapo", "Kangaroo", "Kingfisher", "Kiwi", "Koala", "Kudu", "Labradoodle", "Ladybird", "Lemming", "Lemur", "Leopard", "Liger", "Lion", "Lionfish", "Lizard", "Llama", "Lobster", "Lynx", "Macaw", "Magpie", "Maltese", "Manatee", "Mandrill", "Markhor", "Mastiff", "Mayfly", "Meerkat", "Millipede", "Mole", "Molly", "Mongoose", "Mongrel", "Monkey", "Moorhen", "Moose", "Moth", "Mouse", "Mule", "Neanderthal", "Newfoundland", "Newt", "Nightingale", "Numbat", "Ocelot", "Octopus", "Okapi", "Olm", "Opossum", "utan", "Ostrich", "Otter", "Oyster", "Pademelon", "Panther", "Parrot", "Peacock", "Pekingese", "Pelican", "Penguin", "Persian", "Pheasant", "Pig", "Pika", "Pike", "Piranha", "Platypus", "Pointer", "Poodle", "Porcupine", "Possum", "Prawn", "Puffin", "Pug", "Puma", "Quail", "Quetzal", "Quokka", "Quoll", "Rabbit", "Raccoon", "Ragdoll", "Rat", "Rattlesnake", "Reindeer", "Rhinoceros", "Robin", "Rottweiler", "Salamander", "Saola", "Scorpion", "Seahorse", "Seal", "Serval", "Sheep", "Shrimp", "Skunk", "Sloth", "Snail", "Snake", "Snowshoe", "Sparrow", "Sponge", "Squid", "Squirrel", "Starfish", "Stingray", "Stoat", "Swan", "Tang", "Tapir", "Tarsier", "Termite", "Tetra", "Tiffany", "Tiger", "Tortoise", "Toucan", "Tropicbird", "Tuatara", "Turkey", "Uakari", "Uguisu", "Umbrellabird", "Vulture", "Wallaby", "Walrus", "Warthog", "Wasp", "Weasel", "Whippet", "Wildebeest", "Wolf", "Wolverine", "Wombat", "Woodlouse", "Woodpecker", "Wrasse", "Yak", "Zebra", "Zebu", "Zonkey", "Zorse"];
    return {
      getRandom: function() {
        return animals[Math.ceil(Math.random() * animals.length)];
      }
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.factory('api', ["$q", "youtubeEmbedUtils", function($q, youtubeEmbedUtils) {
    var getYoutubeUrls, socket;
    socket = io();
    getYoutubeUrls = function(url) {
      var youtubeRegexp;
      youtubeRegexp = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
      return url.match(youtubeRegexp);
    };
    return {
      stringHasUrl: function(str) {
        var url_regex;
        url_regex = /(https?:\/\/[^\s]+)/g;
        return str.match(url_regex);
      },
      urlIsImage: function(url) {
        return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
      },
      testImage: function(url, callback) {
        var img, timedOut, timeout, timer;
        timeout = 5000;
        timedOut = false;
        timer = null;
        img = new Image;
        img.onerror = img.onabort = function() {
          if (!timedOut) {
            return clearTimeout(timer);
          }
        };
        img.onload = function() {
          if (!timedOut) {
            clearTimeout(timer);
            return callback(url);
          }
        };
        img.src = url;
        return timer = setTimeout(function() {
          return timedOut = true;
        }, timeout);
      },
      socket: socket,
      on: function(event) {
        var deferred;
        deferred = $q.defer();
        socket.once(event, deferred.resolve);
        return deferred.promise;
      },
      api_stats: function() {
        socket.emit("api_stats");
        return this.on("api_stats");
      },
      get_online_count: function() {
        socket.emit("get_online_count");
        return this.on("get_online_count");
      },
      findUser: function(id) {
        socket.emit("getuser", id);
        return this.on("user");
      },
      load_chat_messages: function(chat_id) {
        socket.emit("load_chat_messages", chat_id);
        return this.on("load_chat_messages");
      },
      save_chat_messages: function(data) {
        socket.emit("save_chat_message", data);
        return this.on("save_chat_message");
      },
      getYoutubeUrls: getYoutubeUrls,
      isYoutubeUrl: function(url) {
        return getYoutubeUrls(url) != null;
      },
      getYoutubeIdFromUrl: function(url) {
        var ref;
        return youtubeEmbedUtils.getIdFromURL((ref = getYoutubeUrls(url)) != null ? ref[0] : void 0);
      }
    };
  }]);

}).call(this);
