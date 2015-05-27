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
    return $rootScope.page_title = "Chat";
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('camera', ["$mdDialog", "api", function($mdDialog, api) {
    return {
      templateUrl: "directives/chat/camera.html",
      restrict: 'E',
      link: function($scope, element, attrs) {
        var canvas, context, convertCanvasToImage, errBack, start, video, videoObj;
        $scope.imageTaken = false;
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        video = document.getElementById('video');
        videoObj = {
          'video': true
        };
        errBack = function(error) {
          return console.log('Video capture error: ', error.code);
        };
        convertCanvasToImage = function(canvas) {
          var e, image, picture;
          image = new Image;
          try {
            picture = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
          } catch (_error) {
            e = _error;
            picture = canvas.toDataURL().split(',')[1];
          }
          return picture;
        };
        start = function() {
          if (navigator.getUserMedia) {
            return navigator.getUserMedia(videoObj, function(stream) {
              window.camera = stream;
              video.stream = stream;
              video.src = stream;
              return video.play();
            }, errBack);
          } else if (navigator.webkitGetUserMedia) {
            return navigator.webkitGetUserMedia(videoObj, function(stream) {
              window.camera = stream;
              video.stream = stream;
              if (window.URL) {
                video.src = window.URL.createObjectURL(stream);
              } else {
                video.src = window.webkitURL.createObjectURL(stream);
              }
              return video.play();
            }, errBack);
          } else if (navigator.mozGetUserMedia) {
            return navigator.mozGetUserMedia(videoObj, function(stream) {
              window.camera = stream;
              video.stream = stream;
              video.src = window.URL.createObjectURL(stream);
              return video.play();
            }, errBack);
          }
        };
        $scope.retake = function() {
          start();
          return $scope.imageTaken = false;
        };
        $scope.send = function() {
          var image;
          $scope.sending = true;
          image = convertCanvasToImage(canvas);
          return api.upload_to_imgur(image, {
            canvas: true
          }).then(function(imgur) {
            $scope.sending = false;
            return $mdDialog.hide(imgur);
          });
        };
        $scope.takePhoto = function() {
          $scope.imageTaken = true;
          context.drawImage(video, 0, 0, 640, 480);
          return video.stream.stop();
        };
        if (api.cameraIsSupported()) {
          return start();
        }
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive("messages", ["$rootScope", "$timeout", "$interval", "$mdDialog", "$mdBottomSheet", "$mdMedia", "api", function($rootScope, $timeout, $interval, $mdDialog, $mdBottomSheet, $mdMedia, api) {
    return {
      templateUrl: "directives/chat/messages.html",
      scope: {
        room: "=",
        chatId: "="
      },
      link: function($scope) {
        var getMessages, listenToMessages, processMessage, processMessages;
        $scope.messages = {};
        $scope.whitespaces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        $scope.messagesFetched = {};
        $scope.youtubeOptions = {
          autoplay: false
        };
        $scope.openImage = function(item) {
          ga('send', 'event', 'openImage', $scope.chatId, item.hasImage);
          return $mdDialog.show({
            templateUrl: 'directives/chat/image-preview.html',
            locals: {
              image: item
            },
            controller: ["$scope", "image", function($scope, image) {
              return $scope.image = image.hasImage;
            }]
          });
        };
        $scope.openYoutubeVideo = function(item) {
          ga('send', 'event', 'openYoutubeVideo', $scope.chatId, item.youtubeId);
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
              var i, len, message, ref, results;
              ref = $scope.messages[row.room_id];
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                message = ref[i];
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
            color: api.intToARGB(api.hashCode(row.from)),
            youtubeId: youtubeId
          };
          if (!$scope.messages[row.room_id]) {
            $scope.messages[row.room_id] = [];
          }
          return $scope.messages[row.room_id].push(data);
        };
        processMessages = function(room_id, messages) {
          var i, len, message, results;
          $scope.messagesFetched[room_id] = true;
          results = [];
          for (i = 0, len = messages.length; i < len; i++) {
            message = messages[i];
            results.push(processMessage(message));
          }
          return results;
        };
        getMessages = function(room_id) {
          return api.load_chat_messages_for_room({
            room_id: room_id,
            chat_id: $scope.chatId
          }).then(function(messages) {
            return processMessages(room_id, messages);
          });
        };
        $rootScope.$on("getMessages", function(event, room_id) {
          ga('send', 'event', 'messages', 'getMessages', $scope.chatId, room_id);
          return getMessages(room_id);
        });
        listenToMessages = function() {
          return api.socket.on("save_chat_message", function(message) {
            processMessage(message);
            return $rootScope.$broadcast("message-notification", message.room_id);
          });
        };
        $scope.showGridBottomSheet = function($event) {
          ga('send', 'event', 'click', 'showGridBottomSheet', $scope.chatId);
          return $mdBottomSheet.show({
            templateUrl: 'directives/chat/bottom-sheet.html',
            controller: 'GridBottomSheetCtrl',
            targetEvent: $event
          });
        };
        return listenToMessages();
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive("chat", ["$rootScope", "$timeout", "$mdSidenav", "$mdDialog", "api", "tabActive", function($rootScope, $timeout, $mdSidenav, $mdDialog, api, tabActive) {
    return {
      templateUrl: "directives/chat/chat.html",
      link: function($scope) {
        var checkCommands, createMessage, listenToMessageNotifications, listenToTyping, postImage, setTopic, unreadMessages;
        $scope.chat_id = "chat-123";
        $scope.room_id = 1;
        $scope.message = '';
        $scope.tabVisible = true;
        $scope.currentRoom = false;
        $scope.peopleTyping = [];
        $scope.peopleTypingTimeout = {};
        $scope.from = api.getUsername();
        $scope.cameraSupported = api.cameraIsSupported();
        unreadMessages = 0;
        tabActive.check(function(status) {
          return $timeout(function() {
            $scope.tabVisible = status === "hidden";
            if (!$scope.tabVisible) {
              unreadMessages = 0;
              return $rootScope.page_title = "Chat";
            }
          });
        });
        $rootScope.$on("currentRoom", function(event, room) {
          $scope.currentRoom = room;
          return $scope.room_id = room.room_id;
        });
        listenToMessageNotifications = function() {
          return $rootScope.$on("message-notification", function(event, room_id) {
            if ($scope.tabVisible) {
              unreadMessages++;
              return $rootScope.page_title = "(" + unreadMessages + ") Chat";
            }
          });
        };
        createMessage = function(data) {
          var possibleUrl;
          if (!data.message) {
            return;
          }
          if (checkCommands(data.message)) {
            return;
          }
          data.room_id = $scope.room_id;
          data.chat_id = $scope.chat_id;
          possibleUrl = api.stringHasUrl(data.message);
          if ((possibleUrl != null ? possibleUrl[0] : void 0) && api.urlIsImage(possibleUrl[0])) {
            api.testImage(possibleUrl[0], function() {
              return ga('send', 'event', 'sharedImage', data.chat_id, possibleUrl[0]);
            });
          }
          return api.save_chat_messages(data);
        };
        $scope.browseHistory = function(key) {
          var message;
          if (key === "Up") {
            message = api.messageHistory.up($scope.room_id);
            if (message) {
              $scope.message = message;
            }
          }
          if (key === "Down") {
            return $scope.message = api.messageHistory.down($scope.room_id);
          }
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
          api.messageHistory.saveMessageHistory($scope.message);
          $scope.message = '';
          return createMessage(data);
        };
        $scope.toggleLeft = function() {
          return $mdSidenav('left').toggle();
        };
        $scope.closeLeft = function() {
          return $mdSidenav('left').close();
        };
        $scope.i_am_typing = function() {
          return api.i_am_typing($scope.from);
        };
        listenToTyping = function() {
          return api.socket.on("typing", function(from) {
            if ($scope.peopleTyping.indexOf(from) === -1) {
              $scope.peopleTyping.push(from);
            }
            if ($scope.peopleTypingTimeout[from]) {
              $timeout.cancel($scope.peopleTypingTimeout[from]);
            }
            return $scope.peopleTypingTimeout[from] = $timeout(function() {
              var index;
              index = $scope.peopleTyping.indexOf(from);
              if (index > -1) {
                return $scope.peopleTyping.splice(index, 1);
              }
            }, 3000);
          });
        };
        $scope.setUsername = function() {
          if (!localStorage) {
            return false;
          }
          ga('send', 'event', 'setUsername', $scope.chat_id, $scope.from);
          return localStorage.setItem("name", $scope.from);
        };
        checkCommands = function(message) {
          var command, content;
          if (message[0] !== "/") {
            return false;
          }
          content = message.split(" ");
          command = content[0].replace("/", "");
          if (command === "topic") {
            setTopic(content.slice(1).join(" "));
            return true;
          }
          if (command === "join" || command === "j") {
            $rootScope.$broadcast("joinRoom", content.slice(1).join(" "));
            return true;
          }
          return false;
        };
        setTopic = function(topic) {
          ga('send', 'event', 'setTopic', $scope.chat_id, topic);
          $scope.currentRoom.topic = topic;
          return api.set_topic({
            topic: topic,
            room_id: $scope.room_id,
            chat_id: $scope.chat_id
          });
        };
        postImage = function(imgur) {
          var data;
          data = {
            data: imgur.data,
            chat_id: $scope.chat_id,
            room_id: $scope.room_id,
            sid: yolosid
          };
          api.saveImgurData(data);
          $scope.message = imgur.data.link;
          return $scope.saveMessage();
        };
        $scope.useCamera = function() {
          ga('send', 'event', 'useCamera', $scope.chat_id, $scope.room_id);
          return $mdDialog.show({
            templateUrl: 'directives/chat/camera-dialog.html'
          }).then(function(result) {
            postImage(result);
            return ga('send', 'event', 'used camera, saved picture', $scope.chat_id, $scope.room_id);
          }, function() {
            var ref;
            return (ref = window.camera) != null ? ref.stop() : void 0;
          });
        };
        $scope.selectFile = function() {
          document.getElementById("image-upload").click();
          return document.getElementsByClassName("select-file-container")[0].blur();
        };
        $scope.uploadFile = function(element) {
          var ref;
          if (!(element != null ? (ref = element.files) != null ? ref[0] : void 0 : void 0)) {
            return;
          }
          ga('send', 'event', 'uploaded image', $scope.chat_id, $scope.room_id);
          return api.upload_to_imgur(element.files[0]).then(function(result) {
            postImage(result);
            return angular.element(element).val(null);
          });
        };
        listenToMessageNotifications();
        return listenToTyping();
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

  app.directive('connectionLost', ["$timeout", "$interval", "$mdToast", "api", function($timeout, $interval, $mdToast, api) {
    return {
      restrict: 'E',
      link: function($scope, element, attrs) {
        var interval, timeout;
        interval = null;
        timeout = null;
        return api.socket.on('disconnect', function() {
          var content, toast;
          content = 'Connection lost, trying to reconnect..';
          toast = $mdToast.simple().content(content).position('right').hideDelay(0);
          $mdToast.show(toast);
          if (interval) {
            $interval.cancel(interval);
          }
          if (timeout) {
            $timeout.cancel(timeout);
          }
          timeout = $timeout(function() {
            var seconds;
            seconds = 0;
            return interval = $interval(function() {
              var newMessage;
              seconds++;
              newMessage = content + " " + seconds + " sec..";
              return $mdToast.updateContent(newMessage);
            }, 1000);
          }, 4000);
          return api.socket.once('connect', function() {
            if (interval) {
              $interval.cancel(interval);
            }
            if (timeout) {
              $timeout.cancel(timeout);
            }
            return $mdToast.hide().then(function() {
              toast = $mdToast.simple().content('Reconnected! Happy chatting :)').position('right');
              return $mdToast.show(toast);
            });
          });
        });
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('fileModel', ["$parse", function($parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var model, modelSetter;
        model = $parse(attrs.fileModel);
        modelSetter = model.assign;
        return element.bind('change', function() {
          return scope.$apply(function() {
            return modelSetter(scope, element[0].files[0]);
          });
        });
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('keydown', function() {
    return {
      restrict: 'A',
      scope: {
        callback: "&keydown"
      },
      link: function($scope, element, attrs) {
        return element.bind("keydown", function(event) {
          if (!(event != null ? event.keyIdentifier : void 0)) {
            return;
          }
          return $scope.callback({
            key: event.keyIdentifier
          });
        });
      }
    };
  });

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

  app.directive("rooms", ["$rootScope", "$timeout", "api", "chatRooms", function($rootScope, $timeout, api, chatRooms) {
    return {
      templateUrl: "directives/chat/rooms.html",
      scope: {
        chatId: "="
      },
      link: function($scope) {
        var getRooms, getSelectedRoom, getTopic, joinRoom, listenToMessageNotifications, listenToTopicChange;
        $scope.rooms = [];
        getTopic = function(room_id) {
          return api.get_topic({
            room_id: room_id,
            chat_id: $scope.chatId
          }).then(function(topic) {
            return $timeout(function() {
              var i, len, ref, results, room;
              ref = $scope.rooms;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                room = ref[i];
                if (room.room_id === room_id) {
                  results.push(room.topic = topic != null ? topic.topic : void 0);
                }
              }
              return results;
            });
          });
        };
        getSelectedRoom = function() {
          var i, len, ref, room;
          ref = $scope.rooms;
          for (i = 0, len = ref.length; i < len; i++) {
            room = ref[i];
            if (room.$selected === true) {
              return room;
            }
          }
          return false;
        };
        $scope.setActiveRoom = function(room) {
          var previousSelectedRoom;
          if (localStorage) {
            localStorage.setItem("selected-room", room.room_id);
          }
          if (!room.$messagesFetched) {
            $timeout(function() {
              room.$messagesFetched = true;
              return $rootScope.$broadcast("getMessages", room.room_id);
            });
          }
          previousSelectedRoom = getSelectedRoom();
          if (previousSelectedRoom != null) {
            previousSelectedRoom.$selected = false;
          }
          room.$selected = true;
          room.messages = 0;
          $rootScope.$broadcast("currentRoom", room);
          if (!room.$topicFetched) {
            room.$topicFetched = true;
            getTopic(room.room_id);
          }
          return ga('send', 'event', 'rooms', 'setActiveRoom', room.name, room.room_id);
        };
        listenToTopicChange = function() {
          return api.socket.on("topic", function(topic) {
            var room;
            room = getSelectedRoom();
            return room.topic = topic != null ? topic.topic : void 0;
          });
        };
        listenToMessageNotifications = function() {
          return $rootScope.$on("message-notification", function(event, room_id) {
            var i, len, ref, results, room;
            ref = $scope.rooms;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              room = ref[i];
              if (room.$selected !== true) {
                if (room.room_id === room_id) {
                  results.push(room.messages++);
                } else {
                  results.push(void 0);
                }
              }
            }
            return results;
          });
        };
        joinRoom = function(room_name) {
          var i, len, ref, results, room;
          room_name = room_name.toLowerCase();
          ref = $scope.rooms;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            room = ref[i];
            if (!(room.name.toLowerCase() === room_name)) {
              continue;
            }
            ga('send', 'event', 'joinRoom', $scope.chat_id, room_name);
            results.push($scope.setActiveRoom(room));
          }
          return results;
        };
        getRooms = function() {
          chatRooms.get().then(function(rooms) {
            var i, len, previousRoom, ref, room, selected_room;
            $scope.rooms = rooms;
            selected_room = $scope.rooms[0];
            previousRoom = typeof localStorage !== "undefined" && localStorage !== null ? localStorage.getItem("selected-room") : void 0;
            if (previousRoom) {
              ref = $scope.rooms;
              for (i = 0, len = ref.length; i < len; i++) {
                room = ref[i];
                if (room.room_id === Number(previousRoom)) {
                  selected_room = room;
                }
              }
            }
            return $scope.setActiveRoom(selected_room);
          });
          return $rootScope.$on("joinRoom", function(event, room_name) {
            return joinRoom(room_name);
          });
        };
        getRooms();
        listenToMessageNotifications();
        return listenToTopicChange();
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

  app.factory('api', ["$q", "youtubeEmbedUtils", "uploadImgur", "messageHistory", "animals", "testImage", function($q, youtubeEmbedUtils, uploadImgur, messageHistory, animals, testImage) {
    var getYoutubeUrls, socket;
    socket = io();
    getYoutubeUrls = function(url) {
      var youtubeRegexp;
      youtubeRegexp = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
      return url.match(youtubeRegexp);
    };
    return {
      messageHistory: messageHistory,
      urlIsImage: testImage.urlIsImage,
      testImage: testImage.test,
      socket: socket,
      getYoutubeUrls: getYoutubeUrls,
      cameraIsSupported: function() {
        var cameraSupported;
        cameraSupported = false;
        if (navigator.getUserMedia) {
          cameraSupported = true;
        } else if (navigator.webkitGetUserMedia) {
          cameraSupported = true;
        } else if (navigator.mozGetUserMedia) {
          cameraSupported = true;
        }
        return cameraSupported;
      },
      saveImgurData: function(data) {
        return socket.emit("save_imgur", data);
      },
      getUsername: function() {
        var name;
        name = (typeof localStorage !== "undefined" && localStorage !== null ? localStorage.getItem("name") : void 0) || ((animals.getRandom()) + "-" + (Math.ceil(Math.random() * 100)));
        ga('send', 'event', 'usernames', 'randomName', name);
        return name;
      },
      hashCode: function(str) {
        var hash, i;
        hash = 0;
        i = 0;
        while (i < str.length) {
          hash = str.charCodeAt(i) + (hash << 5) - hash;
          i++;
        }
        return hash;
      },
      intToARGB: function(i) {
        var h;
        h = (i >> 24 & 0xFF).toString(16) + (i >> 16 & 0xFF).toString(16) + (i >> 8 & 0xFF).toString(16) + (i & 0xFF).toString(16);
        return h.substring(0, 6);
      },
      stringHasUrl: function(str) {
        var url_regex;
        url_regex = /(https?:\/\/[^\s]+)/g;
        return str.match(url_regex);
      },
      on: function(event) {
        var deferred;
        deferred = $q.defer();
        socket.once(event, deferred.resolve);
        return deferred.promise;
      },
      i_am_typing: function(from) {
        return socket.emit("i_am_typing", from);
      },
      api_stats: function() {
        socket.emit("api_stats");
        return this.on("api_stats");
      },
      get_topic: function(arg) {
        var chat_id, room_id;
        chat_id = arg.chat_id, room_id = arg.room_id;
        socket.emit("load_topic", {
          chat_id: chat_id,
          room_id: room_id
        });
        return this.on("topic");
      },
      set_topic: function(data) {
        return socket.emit("save_topic", data);
      },
      get_online_count: function() {
        socket.emit("get_online_count");
        return this.on("get_online_count");
      },
      load_chat_messages_for_room: function(arg) {
        var chat_id, room_id;
        chat_id = arg.chat_id, room_id = arg.room_id;
        socket.emit("load_chat_messages_for_room", {
          chat_id: chat_id,
          room_id: room_id
        });
        return this.on("load_chat_messages_for_room");
      },
      save_chat_messages: function(data) {
        socket.emit("save_chat_message", data);
        return this.on("save_chat_message");
      },
      isYoutubeUrl: function(url) {
        return getYoutubeUrls(url) != null;
      },
      getYoutubeIdFromUrl: function(url) {
        var ref;
        return youtubeEmbedUtils.getIdFromURL((ref = getYoutubeUrls(url)) != null ? ref[0] : void 0);
      },
      upload_to_imgur: function(file, options) {
        return uploadImgur.upload(file, options);
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.factory('chatRooms', ["$q", function($q) {
    return {
      get: function() {
        var deferred, rooms;
        deferred = $q.defer();
        rooms = [
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
          }, {
            room_id: 4,
            name: "Politics",
            messages: 0,
            icon: 'http://i.imgur.com/JxtD1vcb.jpg'
          }, {
            room_id: 5,
            name: "Pictures of cats",
            messages: 0,
            icon: 'http://i.imgur.com/RaKwQD7b.jpg'
          }, {
            room_id: 6,
            name: "Best of Youtube",
            messages: 0,
            icon: 'http://i.imgur.com/aaVkYvxb.png'
          }, {
            room_id: 7,
            name: "Usersub",
            messages: 0,
            icon: 'http://i.imgur.com/YQwZUiJb.gif'
          }
        ];
        deferred.resolve(rooms);
        return deferred.promise;
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module("app");

  app.factory("messageHistory", function() {
    var down, getMessageHistory, globalHistory, historyLocation, saveMessageHistory, up;
    getMessageHistory = function() {
      var history;
      history = localStorage.getItem("message-history");
      if (!history) {
        return [];
      }
      return JSON.parse(history);
    };
    globalHistory = getMessageHistory();
    historyLocation = globalHistory.length;
    saveMessageHistory = function(message) {
      var history;
      if (!localStorage) {
        return;
      }
      history = localStorage.getItem("message-history") || "[]";
      history = JSON.parse(history);
      history.push(message);
      globalHistory = history;
      historyLocation = history.length;
      return localStorage.setItem("message-history", JSON.stringify(history));
    };
    up = function(room_id) {
      if (historyLocation < 0) {
        return false;
      }
      historyLocation--;
      if (historyLocation < 0) {
        historyLocation = 0;
      }
      ga('send', 'event', 'browseHistory', 'Up', room_id);
      return globalHistory[historyLocation];
    };
    down = function(room_id) {
      if (historyLocation + 1 > globalHistory.length) {
        return '';
      }
      historyLocation++;
      ga('send', 'event', 'browseHistory', 'Down', room_id);
      return globalHistory[historyLocation];
    };
    return {
      saveMessageHistory: saveMessageHistory,
      up: up,
      down: down
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.factory('tabActive', function() {
    return {
      check: function(callback) {
        var hidden, onchange;
        hidden = 'hidden';
        onchange = function(event) {
          var evt, evtMap, h, v;
          v = 'visible';
          h = 'hidden';
          evtMap = {
            focus: v,
            focusin: v,
            pageshow: v,
            blur: h,
            focusout: h,
            pagehide: h
          };
          evt = evt || window.event;
          if ((evt != null ? evt.type : void 0) in evtMap) {
            return callback(evtMap[evt.type]);
          } else {
            return callback(this[hidden] ? 'hidden' : 'visible');
          }
        };
        if (hidden in document) {
          document.addEventListener('visibilitychange', onchange);
        } else if ((hidden = 'mozHidden') in document) {
          document.addEventListener('mozvisibilitychange', onchange);
        } else if ((hidden = 'webkitHidden') in document) {
          document.addEventListener('webkitvisibilitychange', onchange);
        } else if ((hidden = 'msHidden') in document) {
          document.addEventListener('msvisibilitychange', onchange);
        } else if ('onfocusin' in document) {
          document.onfocusin = document.onfocusout = onchange;
        } else {
          window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
        }
        if (document[hidden] !== void 0) {
          return onchange({
            type: document[hidden] ? 'blur' : 'focus'
          });
        }
      }
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.factory('testImage', function() {
    return {
      urlIsImage: function(url) {
        return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
      },
      test: function(url, callback) {
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
      }
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module("app");

  app.factory("uploadImgur", ["$q", function($q) {
    var clientId;
    clientId = "3631cecbf2bf2cf";
    return {
      upload: function(file, options) {
        var deferred, fd, ref, xhr;
        if (options == null) {
          options = {};
        }
        deferred = $q.defer();
        if (!file) {
          deferred.reject("No file");
          return deferred.promise;
        }
        if (!options.canvas && !(file != null ? (ref = file.type) != null ? ref.match(/image.*/) : void 0 : void 0)) {
          deferred.reject("File not image");
          return deferred.promise;
        }
        xhr = new XMLHttpRequest();
        xhr.open("POST", "https://api.imgur.com/3/image.json");
        xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
        if (!options.canvas) {
          fd = new FormData();
          fd.append("image", file);
          xhr.send(fd);
        }
        if (options.canvas) {
          xhr.send(file);
        }
        xhr.onload = function() {
          var result;
          result = JSON.parse(xhr.responseText);
          return deferred.resolve(result);
        };
        return deferred.promise;
      }
    };
  }]);

}).call(this);
