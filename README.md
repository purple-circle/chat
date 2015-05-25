chat

```
npm install
npm install pm2 -g
```


```
gulp watch
```


```
pm2 start app.js -i max --watch
pm2 start jobs/api.js --watch
```

This will work with sockets

```
pm2 start app.js --watch
pm2 start jobs/api.js --watch
```

[Issues with pm2 -i max and sockets](https://github.com/Unitech/PM2/issues/637)


```
npm install -g protractor
webdriver-manager update
webdriver-manager start
```

To run protractor

```
gulp test
```


To lint the code

```
gulp lintcode
```
