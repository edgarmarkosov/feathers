'use strict';

var wrappers = require('./wrappers');

module.exports = function (config) {
  config = config || {};

  var handler = config.handler || function (req, res) {
    res.format({
      'application/json': function () {
        res.json(res.data);
      }
    });
  };

  if (typeof config === 'function') {
    handler = config;
  }

  return function () {
    var app = this;

    app.enable('feathers rest');

    app.use(function (req, res, next) {
      req.feathers = {};
      next();
    });

    app.rest = wrappers;

    // Register the REST provider
    app.providers.push(function (path, service, options) {
      if (app.disabled('feathers rest')) {
        return;
      }

      var middleware = (options && options.middleware) || [];
      var uri = path.indexOf('/') === 0 ? path : '/' + path;
      var baseRoute = app.route(uri);
      //var idRoute = app.route(uri + '/:id');

      // GET / -> service.find(cb, params)
      //baseRoute.get.apply(baseRoute, middleware.concat(app.rest.find(service)));
      // POST -> service.create(data, params, cb)
      baseRoute.post.apply(baseRoute, middleware.concat(app.rest.create(service)));

      // GET / -> service.get(params, cb)
      baseRoute.get.apply(baseRoute, middleware.concat(app.rest.get(service)));
      // PUT / -> service.update(data, params, cb)
      baseRoute.put.apply(baseRoute, middleware.concat(app.rest.update(service)));
      // PATCH / -> service.patch(data, params, callback)
      baseRoute.patch.apply(baseRoute, middleware.concat(app.rest.patch(service)));
      // DELETE / -> service.remove(params, cb)
      baseRoute.delete.apply(baseRoute, middleware.concat(app.rest.remove(service)));

/*      // GET /:id -> service.get(id, params, cb)
      idRoute.get.apply(idRoute, middleware.concat(app.rest.getById(service)));
      // PUT /:id -> service.update(id, data, params, cb)
      idRoute.put.apply(idRoute, middleware.concat(app.rest.updateById(service)));
      // PATCH /:id -> service.patch(id, data, params, callback)
      idRoute.patch.apply(idRoute, middleware.concat(app.rest.patchById(service)));
      // DELETE /:id -> service.remove(id, params, cb)
      idRoute.delete.apply(idRoute, middleware.concat(app.rest.removeById(service)));*/

      //app.use(uri, handler);

      app.providersRouterUse[uri] = function(uri) {
        app.use(uri, handler);
      }
    });

  };
};
