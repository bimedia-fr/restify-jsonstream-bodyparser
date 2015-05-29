Restify async body parser
==============================

When using `server.use(restify.bodyParser()`, content is buffered being passed through to restify bodyParser.

With very large content, this quickly becomes a bottleneck, hanging restify thread while reading data.

This library allow to manually bypass the default bodyParser behaviour to avoid blocking the main event loop, by providing a stream (or JSON stream) instead.
This is to the user of the plugin to define if the content will be processed as a stream or as an object.
All other requests are left unchanged.

## Usage

### Setting
```javascript
server.use(require('restify-plugin-bodyparser')());
```

### Sample
```javascript
server.post({
    url: '/',
    streamer: {
        enable: true,
        pattern: '*'
    }
}, function (req, res, next) {
    req.body.pipe(es.writeArray(function (err, content) {
        res.send(err ? 400 : 200, content);
    }))
    .on('end', res.end);
});
```

## Options
As for any restify middleware, you can pass `options`.
Those options will get forwarded to the default `bodyParser` if used.
