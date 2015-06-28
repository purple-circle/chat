(function() {
  'use strict';
  var app, secondsOnSite;

  app = angular.module('app', ['ui.router', 'ui.router.compat', 'templates', 'ngMaterial', 'youtube-embed', 'vimeoEmbed', 'ngSanitize', 'batteryLevel', 'luegg.directives', 'angularMoment', 'imgurUpload']);

  moment.locale('en', {
    calendar: {
      lastDay: '[Yesterday at] LT',
      sameDay: 'LT',
      nextDay: '[Tomorrow at] LT',
      lastWeek: 'dddd [at] LT',
      nextWeek: 'dddd [at] LT',
      sameElse: 'L'
    }
  });

  app.config(["$stateProvider", "$locationProvider", function($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    return $stateProvider.state('root', {
      url: '/',
      abstract: true,
      template: '<ui-view/>'
    }).state('root.index', {
      url: '',
      templateUrl: 'index.html',
      controller: 'index'
    }).state('root.index.room', {
      url: 'room/:room_id',
      controller: 'index.room'
    });
  }]);

  app.run(["$rootScope", function($rootScope) {
    $rootScope.page_title = "Loading chat..";
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

  if (/PhantomJS/.test(window.navigator.userAgent)) {
    ga('send', 'event', 'PhantomJS', 'window.navigator.userAgent');
  }

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
    $rootScope.page_title = "Chat";
    return $scope.chatId = "chat-123";
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.controller('index.room', ["$rootScope", "$scope", "$stateParams", function($rootScope, $scope, $stateParams) {
    return $scope.roomId = $stateParams.room_id;
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.controller('simpleDialog', ["$scope", "$mdDialog", function($scope, $mdDialog) {
    return $scope.close = function() {
      return $mdDialog.cancel();
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('bouncyLoader', function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/chat/bouncy-loader.html'
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('camera', ["$timeout", "$mdDialog", "api", function($timeout, $mdDialog, api) {
    return {
      templateUrl: "directives/chat/camera.html",
      restrict: 'E',
      link: function($scope, element, attrs) {
        var canvas, context, convertCanvasToImage, errBack, hideProgressBar, setup, start, video, videoObj;
        $scope.imageTaken = false;
        $scope.readyToTakeImage = false;
        $scope.uploadProgress = 0;
        $scope.showProgress = false;
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
        setup = function(stream) {
          window.camera = stream;
          video.stream = stream;
          video.play();
          return $scope.readyToTakeImage = true;
        };
        start = function() {
          if (navigator.getUserMedia) {
            return navigator.getUserMedia(videoObj, function(stream) {
              video.src = stream;
              return setup(stream);
            }, errBack);
          } else if (navigator.webkitGetUserMedia) {
            return navigator.webkitGetUserMedia(videoObj, function(stream) {
              if (window.URL) {
                video.src = window.URL.createObjectURL(stream);
              } else {
                video.src = window.webkitURL.createObjectURL(stream);
              }
              return setup(stream);
            }, errBack);
          } else if (navigator.mozGetUserMedia) {
            return navigator.mozGetUserMedia(videoObj, function(stream) {
              video.src = window.URL.createObjectURL(stream);
              return setup(stream);
            }, errBack);
          }
        };
        $scope.cancel = function() {
          return $mdDialog.cancel();
        };
        $scope.retake = function() {
          start();
          return $scope.imageTaken = false;
        };
        hideProgressBar = function() {
          var hideProgressBarTimeout;
          if (hideProgressBarTimeout) {
            $timeout.cancel(hideProgressBarTimeout);
          }
          return hideProgressBarTimeout = $timeout(function() {
            return $scope.showProgress = false;
          }, 1000);
        };
        $scope.send = function() {
          var image, upload_error, upload_notify, upload_success;
          upload_success = function(imgur) {
            $scope.sending = false;
            hideProgressBar();
            return $mdDialog.hide(imgur);
          };
          upload_error = function(err) {
            return hideProgressBar();
          };
          upload_notify = function(progress) {
            return $timeout(function() {
              return $scope.uploadProgress = progress;
            });
          };
          $scope.showProgress = true;
          $scope.uploadProgress = 0;
          $scope.sending = true;
          image = convertCanvasToImage(canvas);
          return api.upload_to_imgur(image, {
            canvas: true
          }).then(upload_success, upload_error, upload_notify);
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

  app.directive("chat", ["$rootScope", "$mdSidenav", function($rootScope, $mdSidenav) {
    return {
      templateUrl: "directives/chat/chat.html",
      scope: {
        chatId: "=",
        roomId: "="
      },
      link: function($scope) {
        $scope.currentRoom = false;
        $rootScope.$on("currentRoom", function(event, room) {
          $scope.currentRoom = room;
          return $scope.roomId = room._id;
        });
        $scope.toggleLeft = function() {
          return $mdSidenav('left').toggle();
        };
        $scope.closeLeft = function() {
          return $mdSidenav('left').close();
        };
        return $scope.loadMore = function() {
          return $rootScope.$broadcast("load-more-messages", $scope.roomId);
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

  app.directive('connectionLost', ["$timeout", "$interval", "api", function($timeout, $interval, api) {
    return {
      restrict: 'E',
      link: function($scope, element, attrs) {
        var checkIntervalsAndTimeouts, interval, timeout;
        interval = null;
        timeout = null;
        checkIntervalsAndTimeouts = function() {
          if (interval) {
            $interval.cancel(interval);
          }
          if (timeout) {
            return $timeout.cancel(timeout);
          }
        };
        return api.socket.on('disconnect', function() {
          var content;
          api.notification.hide();
          ga('send', 'event', 'connection', 'disconnect');
          content = 'Connection lost, trying to reconnect..';
          api.notification.set(content, true);
          checkIntervalsAndTimeouts();
          timeout = $timeout(function() {
            var seconds;
            seconds = 0;
            return interval = $interval(function() {
              var newMessage;
              seconds++;
              newMessage = content + " " + seconds + " sec..";
              return api.notification.update(newMessage);
            }, 1000);
          }, 4000);
          return api.socket.once('connect', function() {
            checkIntervalsAndTimeouts();
            return api.notification.hide().then(function() {
              api.notification.set('Reconnected! Happy chatting :)');
              return ga('send', 'event', 'connection', 'reconnect');
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
          if (!(event !== null ? event.keyIdentifier : void 0)) {
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

  app.directive("listenToTyping", ["$timeout", "api", function($timeout, api) {
    return {
      templateUrl: "directives/chat/listen-to-typing.html",
      scope: {
        roomId: "=",
        chatId: "="
      },
      link: function($scope) {
        $scope.peopleTyping = {};
        $scope.peopleTypingTimeout = {};
        return api.socket.on("typing", function(data) {
          var myUsername;
          if (data.roomId !== $scope.roomId || data.chatId !== $scope.chatId) {
            return false;
          }
          myUsername = api.getUsername();
          if (data.from === myUsername) {
            return false;
          }
          if (!$scope.peopleTyping[data.chatId]) {
            $scope.peopleTyping[data.chatId] = {};
          }
          if (!$scope.peopleTyping[data.chatId][data.roomId]) {
            $scope.peopleTyping[data.chatId][data.roomId] = [];
          }
          if ($scope.peopleTyping[data.chatId][data.roomId].indexOf(data.from) === -1) {
            $scope.peopleTyping[data.chatId][data.roomId].push(data.from);
          }
          if ($scope.peopleTypingTimeout[data.from]) {
            $timeout.cancel($scope.peopleTypingTimeout[data.from]);
          }
          return $scope.peopleTypingTimeout[data.from] = $timeout(function() {
            var index;
            index = $scope.peopleTyping[data.chatId][data.roomId].indexOf(data.from);
            if (index > -1) {
              return $scope.peopleTyping[data.chatId][data.roomId].splice(index, 1);
            }
          }, 3000);
        });
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('loader', function() {
    return {
      restrict: 'E',
      scope: {
        currentRoom: '='
      },
      templateUrl: 'directives/chat/loader.html'
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('loadingImage', function() {
    return {
      templateUrl: "directives/chat/loading-image.html",
      scope: {
        url: "=",
        urlText: "@",
        loaded: "=?"
      },
      link: function($scope, element, attrs) {
        var img;
        $scope.loaded = false;
        if (!$scope.url && !$scope.urlText) {
          $scope.error = true;
          return;
        }
        img = new Image();
        img.onerror = img.onabort = function() {
          $scope.error = true;
          return $scope.loaded = false;
        };
        img.onload = function() {
          $scope.error = false;
          return $scope.loaded = true;
        };
        $scope.imageUrl = $scope.url || $scope.urlText;
        return img.src = $scope.imageUrl;
      }
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('login', ["api", "accountData", function(api, accountData) {
    return {
      templateUrl: 'directives/chat/login.html',
      restrict: 'E',
      link: function($scope, element, attrs) {
        $scope.username = api.getUsername();
        api.socket.on("login_error", function(error) {
          $scope.login_in_progress = false;
          return $scope.errors = error;
        });
        return $scope.login = function() {
          var data;
          $scope.errors = {};
          if (!$scope.username) {
            $scope.errors.username = true;
            return;
          }
          if (!$scope.password) {
            $scope.errors.password = true;
            return;
          }
          data = {
            username: $scope.username,
            password: $scope.password
          };
          $scope.login_in_progress = true;
          return api.login(data).then(function(result) {
            $scope.login_in_progress = false;
            return accountData.account = result.account;
          }, function(error) {
            $scope.errors = error;
            return $scope.login_in_progress = false;
          });
        };
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive("mediaPreview", ["$mdDialog", function($mdDialog) {
    return {
      templateUrl: "directives/chat/media-preview.html",
      scope: {
        message: "="
      },
      link: function($scope) {
        $scope.loaded = false;
        $scope.youtubeOptions = {
          autoplay: false
        };
        $scope.openImage = function(image) {
          ga('send', 'event', 'openImage', $scope.chatId, image);
          return $mdDialog.show({
            templateUrl: 'directives/chat/image-preview.html',
            locals: {
              image: image
            },
            controller: ["$scope", "image", function($scope, image) {
              $scope.image = image;
              return $scope.close = function() {
                return $mdDialog.cancel();
              };
            }]
          });
        };
        $scope.openOpenGraphImage = function(image, type) {
          var data;
          data = {
            chatId: $scope.chatId,
            image: image
          };
          return ga('send', 'event', 'openOpenGraphImage', type, JSON.stringify(data));
        };
        $scope.openYoutubeVideo = function(item) {
          ga('send', 'event', 'openYoutubeVideo', $scope.chatId, item.youtubeId);
          return item.videoOpened = true;
        };
        return $scope.openYoutubeDialog = function(youtubeId) {
          ga('send', 'event', 'openYoutubeDialog', $scope.chatId, youtubeId);
          return $mdDialog.show({
            templateUrl: 'directives/chat/youtube-dialog.html',
            locals: {
              youtubeId: youtubeId
            },
            controller: ["$scope", "youtubeId", function($scope, youtubeId) {
              return $scope.youtubeId = youtubeId;
            }]
          });
        };
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive("messageContent", function() {
    return {
      templateUrl: "directives/chat/message-content.html",
      scope: {
        message: "="
      },
      link: function($scope) {
        return $scope.whitespaces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      }
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('messageForm', ["$rootScope", "$timeout", "$mdSidenav", "$mdDialog", "api", "tabActive", "commands", function($rootScope, $timeout, $mdSidenav, $mdDialog, api, tabActive, commands) {
    return {
      restrict: 'E',
      scope: {
        chatId: '=',
        roomId: '=',
        currentRoom: '='
      },
      templateUrl: 'directives/chat/message-form.html',
      link: function($scope) {
        var createMessage, hideProgressBar, hideProgressBarTimeout, postImage;
        $rootScope.$on("currentRoom", function(event, room) {
          $scope.currentRoom = room;
          return $scope.roomId = room._id;
        });
        $scope.message = '';
        $scope.from = api.getUsername();
        $scope.cameraSupported = api.cameraIsSupported();
        $scope.uploadProgress = 0;
        $scope.showProgress = false;
        hideProgressBarTimeout = null;
        createMessage = function(data) {
          var possibleUrl;
          if (!data.message) {
            return;
          }
          if (!data.from) {
            return;
          }
          data.room_id = $scope.roomId;
          data.chat_id = $scope.chatId;
          if (commands.check(data)) {
            return;
          }
          possibleUrl = api.stringHasUrl(data.message);
          if ((possibleUrl !== null ? possibleUrl[0] : void 0) && api.urlIsImage(possibleUrl[0])) {
            api.testImage(possibleUrl[0], function() {
              return ga('send', 'event', 'sharedImage', data.chat_id, possibleUrl[0]);
            });
          }
          return api.save_chat_messages(data);
        };
        $scope.browseHistory = function(key) {
          var message;
          if (key === "Up") {
            message = api.messageHistory.up($scope.roomId);
            if (message) {
              $scope.message = message;
            }
          }
          if (key === "Down") {
            return $scope.message = api.messageHistory.down($scope.roomId);
          }
        };
        $scope.saveMessage = function() {
          var data;
          $scope.focusUsername = false;
          $scope.focusMessage = false;
          if (!$scope.from) {
            api.notification.set('Please set a username');
            $scope.focusUsername = true;
            ga('send', 'event', 'messages', 'empty username', $scope.roomId);
            return;
          }
          if (!$scope.message) {
            api.notification.set('No empty messages :<');
            $scope.focusMessage = true;
            ga('send', 'event', 'messages', 'empty saveMessage', $scope.roomId);
            return;
          }
          ga('send', 'event', 'messages', 'saveMessage', $scope.roomId);
          data = {
            chat_id: $scope.chatId,
            room_id: $scope.roomId,
            message: $scope.message,
            from: $scope.from,
            sid: yolosid
          };
          api.messageHistory.saveMessageHistory($scope.message);
          $scope.message = '';
          return createMessage(data);
        };
        $scope.i_am_typing = function() {
          var data;
          data = {
            from: $scope.from,
            chatId: $scope.chatId,
            roomId: $scope.roomId
          };
          return api.i_am_typing(data);
        };
        $scope.setUsername = function() {
          if (typeof localStorage === "undefined" || localStorage === null) {
            return false;
          }
          ga('send', 'event', 'setUsername', $scope.chatId, $scope.from);
          return localStorage.setItem("name", $scope.from);
        };
        postImage = function(imgur) {
          var data;
          data = {
            data: imgur.data,
            chat_id: $scope.chatId,
            room_id: $scope.roomId,
            sid: yolosid
          };
          api.saveImgurData(data);
          $scope.message = imgur.data.link;
          return $scope.saveMessage();
        };
        $scope.useCamera = function() {
          ga('send', 'event', 'useCamera', $scope.chatId, $scope.roomId);
          return $mdDialog.show({
            templateUrl: 'directives/chat/camera-dialog.html'
          }).then(function(result) {
            postImage(result);
            return ga('send', 'event', 'used camera, saved picture', $scope.chatId, $scope.roomId);
          }, function() {
            var ref;
            return (ref = window.camera) !== null ? ref.stop() : void 0;
          });
        };
        $scope.selectFile = function() {
          document.getElementById("image-upload").click();
          return document.getElementsByClassName("select-file-container")[0].blur();
        };
        hideProgressBar = function() {
          if (hideProgressBarTimeout) {
            $timeout.cancel(hideProgressBarTimeout);
          }
          return hideProgressBarTimeout = $timeout(function() {
            return $scope.showProgress = false;
          }, 1000);
        };
        return $scope.uploadFile = function(element) {
          var ref, upload_error, upload_notify, upload_success;
          if (!(element !== null ? (ref = element.files) !== null ? ref[0] : void 0 : void 0)) {
            return;
          }
          ga('send', 'event', 'uploaded image', $scope.chatId, $scope.roomId);
          upload_success = function(result) {
            return postImage(result).then(function() {
              angular.element(element).val(null);
              return hideProgressBar();
            });
          };
          upload_error = function(err) {
            console.log("err", err);
            ga('send', 'event', 'image upload error', $scope.chatId, JSON.stringify(err));
            return hideProgressBar();
          };
          upload_notify = function(progress) {
            return $timeout(function() {
              return $scope.uploadProgress = progress;
            });
          };
          $scope.showProgress = true;
          $scope.uploadProgress = 0;
          return api.upload_to_imgur(element.files[0]).then(upload_success, upload_error, upload_notify);
        };
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive("messages", ["$rootScope", "$timeout", "$interval", "api", function($rootScope, $timeout, $interval, api) {
    return {
      templateUrl: "directives/chat/messages.html",
      scope: {
        room: "=",
        chatId: "="
      },
      link: function($scope) {
        var appendUrlDataToMessage, checkUserMentions, getMessageById, getMessages, listenToMessages, messagesOpened, page, processMessage, processMessages;
        page = 0;
        $scope.messages = {};
        $scope.messagesFetched = {};
        messagesOpened = new Date().getTime();
        checkUserMentions = function(user_mentions, from) {
          var i, len, myUsername, name, username;
          if (!user_mentions) {
            return false;
          }
          myUsername = api.getUsername();
          myUsername = myUsername.toLowerCase();
          for (i = 0, len = user_mentions.length; i < len; i++) {
            username = user_mentions[i];
            name = username.toLowerCase();
            if (name === myUsername && from !== myUsername) {
              return true;
            }
          }
          return false;
        };
        getMessageById = function(room_id, id) {
          var i, len, message, ref;
          ref = $scope.messages[room_id];
          for (i = 0, len = ref.length; i < len; i++) {
            message = ref[i];
            if (message._id === id) {
              return message;
            }
          }
          return false;
        };
        processMessage = function(row) {
          var data, notify_user, possibleUrls, ref, vimeoId, youtubeId;
          if (!$scope.messages[row.room_id]) {
            $scope.messages[row.room_id] = [];
          }
          if (getMessageById(row.room_id, row._id)) {
            return false;
          }
          if (api.hasYoutubeUrl(row.original_message)) {
            youtubeId = api.getYoutubeIdFromUrl(row.original_message);
          }
          if (api.hasVimeoUrl(row.original_message)) {
            vimeoId = api.getVimeoIdFromUrl(row.original_message);
          }
          possibleUrls = api.stringHasUrl(row.original_message);
          if ((possibleUrls !== null ? possibleUrls[0] : void 0) && api.urlIsImage(possibleUrls !== null ? possibleUrls[0] : void 0)) {
            api.testImage(possibleUrls[0]).then(function() {
              var message;
              message = getMessageById(row.room_id, row._id);
              return message !== null ? message.images = possibleUrls : void 0;
            });
          }
          notify_user = checkUserMentions(row !== null ? (ref = row.metadata) !== null ? ref.user_mentions : void 0 : void 0, row.from);
          if (notify_user) {
            if (new Date(row.created_at).getTime() > messagesOpened) {
              $rootScope.$broadcast("tab-beep");
            }
          }
          data = {
            images: false,
            is_me: api.userIsSender(row.sid),
            color: api.intToARGB(api.hashCode(row.from)),
            youtubeId: youtubeId,
            vimeoId: vimeoId,
            notify_user: notify_user,
            isGreenText: row.original_message[0].trim() === ">"
          };
          return $scope.messages[row.room_id].push(angular.extend(row, data));
        };
        processMessages = function(room_id, messages, page_number) {
          var i, len, message;
          $scope.messagesFetched[room_id] = true;
          for (i = 0, len = messages.length; i < len; i++) {
            message = messages[i];
            message.page = page_number;
            processMessage(message);
          }
          if (page_number > 0) {
            return $timeout(function() {
              var last_message, ref, ref1;
              last_message = messages.length - 1;
              return (ref = document.getElementsByClassName("page-" + page_number)) !== null ? (ref1 = ref[last_message]) !== null ? ref1.scrollIntoView() : void 0 : void 0;
            });
          }
        };
        appendUrlDataToMessage = function(data) {
          var message;
          message = getMessageById(data.message.room_id, data.message._id);
          if (!message) {
            return false;
          }
          return message.url_data = data.url_data;
        };
        getMessages = function(room_id, page_number) {
          return api.load_chat_messages_for_room({
            room_id: room_id,
            chat_id: $scope.chatId,
            page: page_number
          }).then(function(messages) {
            return processMessages(room_id, messages, page_number);
          });
        };
        $rootScope.$on("getMessages", function(event, room_id) {
          ga('send', 'event', 'messages', 'getMessages', $scope.chatId, room_id);
          return getMessages(room_id, page);
        });
        $rootScope.$on("load-more-messages", function(event, room_id) {
          ga('send', 'event', 'messages', 'load-more-messages', $scope.chatId, room_id);
          page++;
          return getMessages(room_id, page);
        });
        listenToMessages = function() {
          api.socket.on("save_chat_message", function(message) {
            processMessage(message);
            return $rootScope.$broadcast("message-notification", message.room_id);
          });
          return api.socket.on("url_data", function(url_data) {
            return appendUrlDataToMessage(url_data);
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

  app.directive('onlineCount', ["$timeout", "api", function($timeout, api) {
    return {
      restrict: 'E',
      scope: {
        chatId: '='
      },
      link: function($scope, element, attrs) {
        api.get_online_count();
        return api.socket.on("get_online_count", function(result) {
          ga('send', 'event', 'onlineCount', $scope.chatId, result);
          return element.html(result);
        });
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive("rooms", ["$rootScope", "$timeout", "$state", "$stateParams", "api", "chatRooms", function($rootScope, $timeout, $state, $stateParams, api, chatRooms) {
    return {
      templateUrl: "directives/chat/rooms.html",
      scope: {
        chatId: "="
      },
      link: function($scope) {
        var createFirstRoom, getRooms, getSelectedRoom, getTopic, joinRoom, listenToMessageNotifications, listenToTopicChange, listenToTyping;
        $scope.rooms = [];
        $scope.peopleTyping = {};
        $scope.peopleTypingTimeout = {};
        listenToTyping = function() {
          return api.socket.on("typing", function(data) {
            var myUsername;
            if (data.chatId !== $scope.chatId) {
              return false;
            }
            myUsername = api.getUsername();
            if (data.from === myUsername) {
              return false;
            }
            myUsername = api.getUsername();
            if (data.from === myUsername) {
              return false;
            }
            if (!$scope.peopleTyping[data.chatId]) {
              $scope.peopleTyping[data.chatId] = {};
            }
            if (!$scope.peopleTyping[data.chatId][data.roomId]) {
              $scope.peopleTyping[data.chatId][data.roomId] = true;
            }
            if ($scope.peopleTypingTimeout[data.from]) {
              $timeout.cancel($scope.peopleTypingTimeout[data.from]);
            }
            return $scope.peopleTypingTimeout[data.from] = $timeout(function() {
              return $scope.peopleTyping[data.chatId][data.roomId] = false;
            }, 3000);
          });
        };
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
                if (room._id === room_id) {
                  results.push(room.topic = topic !== null ? topic.topic : void 0);
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
            localStorage.setItem("selected-room", room._id);
          }
          if (!room.$messagesFetched) {
            $timeout(function() {
              room.$messagesFetched = true;
              return $rootScope.$broadcast("getMessages", room._id);
            });
          }
          previousSelectedRoom = getSelectedRoom();
          if (previousSelectedRoom !== null) {
            previousSelectedRoom.$selected = false;
          }
          room.$selected = true;
          room.messages = 0;
          $rootScope.$broadcast("currentRoom", room);
          if (!room.$topicFetched) {
            room.$topicFetched = true;
            getTopic(room._id);
          }
          ga('send', 'event', 'rooms', 'setActiveRoom', room.name, room._id);
          if (room._id !== $stateParams.room_id) {
            $state.transitionTo("root.index.room", {
              room_id: room._id
            });
          }
          return $timeout(function() {
            var ref;
            return (ref = document.getElementsByClassName("typing-container")) !== null ? ref[0].scrollIntoView() : void 0;
          });
        };
        listenToTopicChange = function() {
          return api.socket.on("topic", function(topic) {
            var room;
            room = getSelectedRoom();
            return room.topic = topic !== null ? topic.topic : void 0;
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
                if (room._id === room_id) {
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
            ga('send', 'event', 'joinRoom', $scope.chatId, room_name);
            results.push($scope.setActiveRoom(room));
          }
          return results;
        };
        createFirstRoom = function() {
          var data, icon, random;
          random = api.getRandomImgurId();
          icon = "http://i.imgur.com/" + random + ".png";
          data = {
            name: "Room #1",
            chat_id: $scope.chatId,
            icon: icon
          };
          return api.create_room(data).then(function(result) {
            ga('send', 'event', 'createFirstRoom', $scope.chatId, result.name);
            return getRooms();
          });
        };
        getRooms = function() {
          chatRooms.get($scope.chatId).then(function(rooms) {
            var i, j, len, len1, previousRoom, ref, room, selected_room;
            if (rooms.length === 0) {
              createFirstRoom();
              return;
            }
            for (i = 0, len = rooms.length; i < len; i++) {
              room = rooms[i];
              room.messages = 0;
            }
            $scope.rooms = rooms;
            selected_room = $scope.rooms[0];
            previousRoom = typeof localStorage !== "undefined" && localStorage !== null ? localStorage.getItem("selected-room") : void 0;
            if (previousRoom) {
              ref = $scope.rooms;
              for (j = 0, len1 = ref.length; j < len1; j++) {
                room = ref[j];
                if (room._id === previousRoom) {
                  selected_room = room;
                }
              }
            }
            return $scope.setActiveRoom(selected_room);
          });
          $rootScope.$on("joinRoom", function(event, room_name) {
            return joinRoom(room_name);
          });
          return $rootScope.$on("room-created", function(event, room) {
            return $scope.rooms.push(room);
          });
        };
        getRooms();
        listenToMessageNotifications();
        listenToTopicChange();
        return listenToTyping();
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('scrollLoadMore', ["$timeout", function($timeout) {
    return {
      scope: {
        callback: "&scrollLoadMore"
      },
      link: function($scope, element, attr) {
        var timeout;
        timeout = null;
        return element.bind('scroll', function() {
          if (element[0].scrollTop < 50) {
            if (timeout) {
              $timeout.cancel(timeout);
            }
            return timeout = $timeout(function() {
              return $scope.callback();
            }, 100);
          }
        });
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('setFocus', function() {
    return {
      restrict: 'A',
      scope: {
        focus: "=setFocus"
      },
      link: function($scope, elem, attr) {
        return $scope.$watch('focus', function() {
          if ($scope.focus) {
            return elem[0].focus();
          }
        });
      }
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('sidenav', function() {
    return {
      restrict: 'E',
      scope: {
        chatId: '='
      },
      templateUrl: 'directives/chat/sidenav.html'
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('signup', ["api", "accountData", function(api, accountData) {
    return {
      templateUrl: "directives/chat/signup.html",
      restrict: 'E',
      link: function($scope, element, attrs) {
        $scope.username = api.getUsername();
        api.socket.on("signup_error", function(error) {
          $scope.signup_in_progress = false;
          return $scope.errors = error;
        });
        return $scope.signup = function() {
          var data;
          $scope.errors = {};
          if (!$scope.username) {
            $scope.errors.username = true;
            return;
          }
          if (!$scope.password) {
            $scope.errors.password = true;
            return;
          }
          data = {
            username: $scope.username,
            password: $scope.password,
            email: $scope.email
          };
          $scope.signup_in_progress = true;
          return api.signup(data).then(function(result) {
            $scope.signup_in_progress = false;
            $scope.result = result;
            return accountData.account = result.account;
          }, function(error) {
            $scope.signup_in_progress = false;
            return $scope.errors = error;
          });
        };
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive("titleNotifier", ["$rootScope", "tabActive", "beep", function($rootScope, tabActive, beep) {
    return {
      link: function($scope) {
        var tabVisible, unreadMessages;
        tabVisible = true;
        unreadMessages = 0;
        tabActive.check(function(status) {
          tabVisible = status !== "hidden";
          if (tabVisible) {
            unreadMessages = 0;
            return $rootScope.page_title = "Chat";
          }
        });
        $rootScope.$on("tab-beep", function() {
          if (!tabVisible) {
            beep.create(4500);
            beep.create(400);
            beep.create(500);
            return beep.create(1200);
          }
        });
        return $rootScope.$on("message-notification", function(event, room_id) {
          if (!tabVisible) {
            unreadMessages++;
            return $rootScope.page_title = "(" + unreadMessages + ") Chat";
          }
        });
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.directive('toolbar', function() {
    return {
      restrict: 'E',
      scope: {
        chatId: '=',
        currentRoom: '='
      },
      templateUrl: 'directives/chat/toolbar.html'
    };
  });

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

  app.service("accountData", function() {
    return {
      account: false
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
        return animals[Math.floor(Math.random() * animals.length)];
      }
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.factory('api', ["$q", "youtubeEmbedUtils", "imgurUpload", "messageHistory", "animals", "testImage", "notification", function($q, youtubeEmbedUtils, imgurUpload, messageHistory, animals, testImage, notification) {
    var getVimeoUrls, getYoutubeUrls, socket;
    socket = io();
    getYoutubeUrls = function(url) {
      var youtubeRegexp;
      youtubeRegexp = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
      return url.match(youtubeRegexp);
    };
    getVimeoUrls = function(url) {
      var vimeoRegexp;
      vimeoRegexp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
      return url.match(vimeoRegexp);
    };
    return {
      messageHistory: messageHistory,
      urlIsImage: testImage.urlIsImage,
      testImage: testImage.test,
      socket: socket,
      getYoutubeUrls: getYoutubeUrls,
      notification: notification,
      hasVimeoUrl: function(url) {
        return getVimeoUrls(url) !== null;
      },
      getVimeoIdFromUrl: function(url) {
        var ref;
        return (ref = getVimeoUrls(url)) !== null ? ref[3] : void 0;
      },
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
        if (typeof localStorage !== "undefined" && localStorage !== null) {
          localStorage.setItem("name", name);
        }
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
      i_am_typing: function(data) {
        return socket.emit("i_am_typing", data);
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
      create_room: function(data) {
        socket.emit("create_room", data);
        return this.on("room_created");
      },
      load_rooms: function(data) {
        socket.emit("load_rooms", data);
        return this.on("rooms");
      },
      get_online_count: function() {
        socket.emit("get_online_count");
        return this.on("get_online_count");
      },
      load_chat_messages_for_room: function(data) {
        socket.emit("load_chat_messages_for_room", data);
        return this.on("load_chat_messages_for_room");
      },
      save_chat_messages: function(data) {
        socket.emit("save_chat_message", data);
        return this.on("save_chat_message");
      },
      update_platform: function() {
        socket.emit("update_platform");
        return this.on("update_platform");
      },
      hasYoutubeUrl: function(url) {
        return getYoutubeUrls(url) !== null;
      },
      getYoutubeIdFromUrl: function(url) {
        var ref;
        return youtubeEmbedUtils.getIdFromURL((ref = getYoutubeUrls(url)) !== null ? ref[0] : void 0);
      },
      upload_to_imgur: function(file, options) {
        imgurUpload.setClientId("3631cecbf2bf2cf");
        return imgurUpload.upload(file, options);
      },
      signup: function(data) {
        socket.emit("signup", data);
        return this.on("signup");
      },
      login: function(data) {
        socket.emit("login", data);
        return this.on("login");
      },
      userIsSender: function(sid, userid) {
        return sid === yolosid;
      },
      getRandomImgurId: function() {
        var imgur_ids;
        imgur_ids = ['h18WTm2b', 'p8SNOcVb', 'CfmbeXib', 'JxtD1vcb', 'RaKwQD7b', 'aaVkYvxb'];
        return imgur_ids[Math.floor(Math.random() * imgur_ids.length)];
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.factory('beep', function() {
    return {
      create: function(hertz) {
        var audioContextFunction, oscillator;
        if ((typeof webkitAudioContext === "undefined" || webkitAudioContext === null) && (typeof AudioContext === "undefined" || AudioContext === null)) {
          return;
        }
        if (AudioContext) {
          audioContextFunction = AudioContext;
        } else {
          audioContextFunction = webkitAudioContext;
        }
        window.beepAudioContext = window.beepAudioContext || new audioContextFunction();
        oscillator = window.beepAudioContext.createOscillator();
        oscillator.connect(window.beepAudioContext.destination);
        oscillator.type = 'square';
        oscillator.frequency.value = hertz;
        oscillator.start();
        return setTimeout(function() {
          return oscillator.stop();
        }, 200);
      }
    };
  });

}).call(this);

(function() {
  var app;

  app = angular.module('app');

  app.factory('chatRooms', ["api", function(api) {
    return {
      get: function(chat_id) {
        return api.load_rooms({
          chat_id: chat_id
        });
      }
    };
  }]);

}).call(this);

(function() {
  var app;

  app = angular.module("app");

  app.service("commands", ["$rootScope", "$mdDialog", "api", function($rootScope, $mdDialog, api) {
    var check, create_room, setTopic;
    setTopic = function(topic, chat_id, room_id) {
      ga('send', 'event', 'setTopic', chat_id, topic);
      return api.set_topic({
        topic: topic,
        room_id: room_id,
        chat_id: chat_id
      });
    };
    create_room = function(name, chat_id, from) {
      var data, icon, random;
      random = api.getRandomImgurId();
      icon = "http://i.imgur.com/" + random + ".png";
      data = {
        name: name,
        chat_id: chat_id,
        sid: yolosid,
        created_by: from,
        icon: icon
      };
      return api.create_room(data).then(function(result) {
        ga('send', 'event', 'createdRoom', chat_id, result.name);
        $rootScope.$broadcast("room-created", result);
        return check({
          message: "/join " + result.name
        });
      });
    };
    check = function(data) {
      var command, content, message;
      message = data.message;
      if (message[0] !== "/") {
        return false;
      }
      content = message.split(" ");
      command = content[0].replace("/", "");
      if (command === "topic") {
        setTopic(content.slice(1).join(" "), data.chat_id, data.room_id);
        return true;
      }
      if (command === "join" || command === "j") {
        $rootScope.$broadcast("joinRoom", content.slice(1).join(" "));
        return true;
      }
      if (command === "create") {
        create_room(content.slice(1).join(" "), data.chat_id, data.from);
        return true;
      }
      if (command === "help") {
        $mdDialog.show({
          templateUrl: 'directives/chat/help.html',
          controller: 'simpleDialog'
        });
        return true;
      }
      if (command === "register" || command === "signup") {
        $mdDialog.show({
          templateUrl: 'directives/chat/signup-dialog.html',
          controller: 'simpleDialog'
        });
        return true;
      }
      if (command === "login" || command === "signin") {
        $mdDialog.show({
          templateUrl: 'directives/chat/login-dialog.html',
          controller: 'simpleDialog'
        });
        return true;
      }
      return false;
    };
    return {
      check: check
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

  app.factory('notification', ["$mdToast", function($mdToast) {
    return {
      hide: function() {
        return $mdToast.hide();
      },
      update: function(message) {
        return $mdToast.updateContent(message);
      },
      set: function(message, hideDelay) {
        var toast;
        toast = $mdToast.simple().content(message).position('right');
        if (hideDelay) {
          toast.hideDelay(0);
        }
        return $mdToast.show(toast);
      }
    };
  }]);

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
          if ((evt !== null ? evt.type : void 0) in evtMap) {
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

  app.service('testImage', ["$q", function($q) {
    var urlIsImage;
    urlIsImage = function(url) {
      var parsedUrl, parser;
      parser = document.createElement('a');
      parser.href = url;
      parsedUrl = parser.protocol + "//" + parser.host + parser.pathname;
      return parsedUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null;
    };
    return {
      urlIsImage: urlIsImage,
      test: function(url) {
        var deferred, img, timedOut, timeout, timer;
        deferred = $q.defer();
        if (!url) {
          deferred.reject('No url provided');
          return deferred.promise;
        }
        if (!urlIsImage(url)) {
          deferred.reject('Provided url doesn\'t contain image');
          return deferred.promise;
        }
        timeout = 5000;
        timedOut = false;
        timer = null;
        img = new Image();
        img.onerror = img.onabort = function() {
          deferred.reject('Image error or aborted');
          if (!timedOut) {
            return clearTimeout(timer);
          }
        };
        img.onload = function() {
          if (!timedOut) {
            clearTimeout(timer);
            return deferred.resolve(url);
          }
        };
        img.src = url;
        timer = setTimeout(function() {
          timedOut = true;
          return deferred.reject('Timeout');
        }, timeout);
        return deferred.promise;
      }
    };
  }]);

}).call(this);
