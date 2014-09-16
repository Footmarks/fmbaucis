# baucis v0.20.5

Baucis enables you to build scalable REST APIs using the open source tools and standards you and your team already know.  Like Baucis and Philemon of old, the module provides REST to the weary traveler.  [Baucis](https://en.wikipedia.org/wiki/Baucis_and_Philemon) is not the same as [Bacchus](https://en.wikipedia.org/wiki/Dionysus).

Baucis is used in production by startups, departments, and at least one Fortune 500 company, not to mention at hackathons and conferences worldwide.

If you like Baucis, [please consider tipping](https://www.gittip.com/wprl/).

The official baucis documentation is being moved to [kun.io/baucis](http://kun.io/baucis) but is still right here for the moment!


## Features

 * Awesomely scalable.  Takes full advantage of the inherent power of Node.js and MongoDB.
 * Automatically build APIs through reflection of your Mongoose schemata.
 * Built on Express so adding custom middleware is a snap.  100% compatible with existing middleware such as passport.
 * Supports geolocation and full text search.
 * Highly customizable, simple interface.  Can be extended with plugins.
 * Automatically generate interactive Swagger documentation for the API.
 * Perform rich queries of the API using an expressive JSON syntax via query string.
 * Mongoose middleware, inheritence, and validation methods are automatically respected.
 * Version your API using semver.
 * Over 150 Mocha.js tests.


### Coming Soon

 * Real time browser/client subscription with EventSource (server sent events)
 * Web hooks
 
Check the [change log](CHANGES.md) for info on all the latest features.


## Examples

 * [Example REST API server built with Node and Baucis](//github.com/wprl/baucis-example)
 * [Examples with Backbone.js](examples/Backbone.js)
 * [Examples with AngularJS](examples/angular-example-resource.html)
 * [Examples with Restangular](examples/angular-example-restangular.html)
 * [Examples with jQuery](examples/jQuery.js)
 * [mongoose-administration-example](https://www.npmjs.org/package/mongoose-administration-example)


![David Rjckaert III - Philemon and Baucis Giving Hospitality to Jupiter and Mercury](http://github.com/wprl/baucis/raw/master/david_rijckaert_iii-philemon_and_baucis.jpg "Hermes is like: 'Hey Baucis, don't kill that goose.  And thanks for the REST.'")

*David Rijckaert - Philemon and Baucis Giving Hospitality to Jupiter and Mercury*



## Getting Started


To install:

    npm install baucis

An example of creating a REST API from a couple Mongoose schemata.

    var Vegetable = new mongoose.Schema({ name: String });
    var Fruit = new mongoose.Schema({ name: String });

    mongoose.model('vegetable', Vegetable);
    mongoose.model('fruit', Fruit);

    // Create a simple controller.
    baucis.rest('vegetable');

    // Create a controller with custom middleware for update/create.
    baucis.rest('fruit').request('put post', function (request, response, next) {
      if (request.isAuthenticated()) return next();
      return response.send(401);
    });

    // Create the app and listen for API requests
    var app = express();
    app.use('/api', baucis());
    app.listen(80);

Later, make requests:

| HTTP Verb     | /vegetables   | /vegetables/:id |
| ------------- | ------------- | --------------- |
| GET           | Get all documents, or documents that match the query conditions. | Get the addressed document. |
| POST          | Creates new documents and sends them back.  You can POST a single document or an array of documents.      | n/a |
| PUT           | n/a | Update the addressed document. |
| DELETE        | Delete all documents, or documents that match the query conditions. | Delete the addressed object. |
| HEAD          | Check what headers would be returned for the given query without sending the request body. | Check what headers would be returned for the instance |


## baucis.rest


`baucis.rest` returns an instance of the controller created to handle the schema's API routes.  Pass in a mongoose model name:

    var controller = baucis.rest('robot');

Or, pass in a Mongoose model:

    var controller = baucis.rest(mongoose.model('robot'));

Controllers are Express apps like any other.

    // Add middleware before API routes
    controller.use('/qux', function (request, response, next) {
      // Do something cool…
      next();
    });

    controller.get('/readme', function (request, response, next) {
      // Send a readme document about the resource (for example)
      next();
    });

    // Do other stuff...
    controller.set('some option name', 'value');
    controller.listen(3000);

Customize them with Express middleware, including pre-existing modules like `passport`.  Middleware can be registered like so:

    controller.request(function (request, response, next) {
      if (request.isAuthenticated()) return next();
      return response.send(401);
    });

##Controllers

### controller.model

This property sets the controller's mongoose model.  A string or model object may be passed in.  The first time the model is set `singular`, `plural`, and `path` will also be set to defaults based on the mongoose model.  The model property is initally set when the controller is first constructed.

    controller.model('cheese');

### controller.singular

Customize the name used for singular instances of documents associated with this controller.  Defaults to the name of the controller's model.

    controller.singular('cactus');

### controller.plural

Customize the name used for groups of documents associated with this controller.  Defaults to the plural of the controller's singular name.  Uses Mongoose's pluralizer utility method.

    controller.plural('cacti');

### controller.select

Select or deselect fields for all queries.

    controller.select('foo +bar -password');

### controller.relations

Set to `true` to enable setting the response Link header with various useful links.  Especially useful for paging.

    controller.relations(true);

### controller.findBy

The unique path used to identify documents for this controller.  Defaults to `_id`.

    controller.findBy('name');

### controller.lastModified

Set the `Last-Modified` HTTP header using the given `Date` field.  Disabl;ed by default.

    controller.lastModified('modified.date');

### controller.locking

Enable optimistic locking.  (Disabled by default.)  Requires that all PUTs must send the document version (`__v` by default) and will send a 409 response if there would be a version conflict, instead of performing the update.

    controller.locking(true);

### controller.hints

Allow sending an index hint for the query from the client.  Disabled by default.

    controller.hints(true);

### controller.comments

Allow sending a query comment from the client.  Disabled by default.

    controller.comments(true);

### controller.methods

Used to disable specific HTTP methods for the controller.

    controller.methods('post put delete', false);

### controller.operators

**BYPASSES VALIDATION** Use this method to enable non-defualt update operators.  The update method can be set using the `X-Baucis-Update-Operator` header field.

    controller.operators('$push $set', 'foo some.path some.other.path');
    controller.operators('$pull', 'another.path');

### controller.vivify

This can be used to add paths under a controller.  For example, a teacher schema might define an array of classrooms.  `controller.vivify` lets embed the classrooms associated with a teacher at a URL like `/teacher/123/classrooms`.

    var teachers = baucis.rest('teacher');
    var classrooms = teachers.vivify('classrooms');

### controller.parentPath

This can be used to note the path the schema defines that is associated with a vivified URL.  For example, in the above example, if the classroom schema didn't use the field `teacher` to link to the teachers collection, but instead used a name of `classTeachers`:

    var teachers = baucis.rest('teacher');
    var classrooms = teachers.vivify('classrooms').parentPath('classTeachers');

### controller.versions


Versioning is implemented using [semver](http://semver.org).  Supported releases are specified when calling `baucis()`.  The release(s) that a controller belongs to are specified with the `versions` controller option.

    baucis.rest('cat').versions('0.0.1');
    baucis.rest('cat').versions('>0.0.1 <1.0.0');
    baucis.rest('cat').versions('~1');
    baucis.rest('cat').versions('>2.0.0');
    app.use('/api', baucis({ releases: [ '0.0.1', '0.0.2', '1.0.0', '1.1.0', '2.0.0' ]}));

Later, make requests and set the `API-Version` header to a [semver](http://semver.org) range, such as `~1`, `>2 <3`, `*`, etc.  Baucis will use the highest release number that satisfies the range.  If no `API-Version` is specified in a request, the highest release will be used.

##Streaming


Baucis takes full advantage of Node streams internally to offer even more performance, especially when dealing with large datasets.  Both outgoing and incoming documents are streamed!

To alter or inspect documents being sent or process, add a through stream that transforms or processes them.  As a shortcut, a map function can be passed in.  It will be used to create a map stream internally.  Here's an example of adding a stream to alter POST'd or PUT'd request bodies:

    controller.request(function (request, response, next) {
      request.baucis.incoming(function (context, callback) {
        context.incoming.name = 'Feverfew';
        callback(null, context);
      });
      next();
    });

For PUT requests, the document is available to the stream.  For POSTs `context.doc` will be set to `null`.

    controller.request(function (request, response, next) {
      request.baucis.incoming(function (context, callback) {
        if (context.doc.created !== context.incoming.created) {
          callback(baucis.errors.Forbidden('The created date cannot be updated'));
          return;
        }
        callback(null, context);
      });
      next();
    });


Passing in through streams is also allowed.  Here's an example using the [through module](https://www.npmjs.org/package/through) to create a stream that checks for a forbidden sort of whiskey and alters the name of incoming (POSTed) documents.

    controller.request(function (request, response, next) {
      request.baucis.incoming(through(function (context) {
        if (context.incoming.whiskey === 'Canadian') {
          // Errors will be passed off to `next` later, and the stream will
          // be stopped.
          this.emit('error', baucis.errors.Forbidden('Too smooth.'));
          return;
        }
        context.incoming.name = 'SHAZAM';
        this.queue(context);
      }));
      next();
    });

If `request.baucis.incoming` or `request.baucis.outgoing` is called multiple times, the multiple through streams will be piped together.

Here's an example of how a stream that interacts with outgoing documents may be added:

    controller.request(function (request, response, next) {
      request.baucis.outgoing(through(function (context) {
        if (context.doc.owner !== request.user) {
          // Errors will be passed off to `next` later, and the stream will
          // be stopped.
          this.emit('error', baucis.errors.Forbidden());
          return;
        }
        delete context.doc.password;
        this.queue(context);
      }));
      next();
    });

-----------

  * For POSTs, if `request.body` is present, the incoming request will be parsed as a whole, negating many of the benefits of streaming.  However, especially when POSTing only one new document at a time, this is not an issue.  If you want to POST many objects at once, using the default streaming behavior is highly recommened.
  * If you set `request.baucis.documents`, this will be streamed out instead of the Mongoose query results.
  * The document stage of middleware has been deprecated.  Use an outgoing through stream instead.


## Middleware


Baucis adds middleware registration functions for two stages of the request cycle:

### request

This stage of middleware will be called after baucis applies defaults based on the request, but before the Mongoose query is generated.

### query

This stage of middleware will be called after baucis applies defaults to the Mongoose query object, but before the documents are streamed out through the response.  The Mongoose query can be accessed and changed in your custom middleware via `request.baucis.query`.  Query middleware cannot be added explicitly for POST and will be ignored when added for POST implicitly.

### How to use baucis middleware

To apply middleware to all API routes, just pass the function or array to the method for the appropriate stage:

    controller.request(function (request, response, next) {
      if (request.isAuthenticated()) return next();
      return response.send(401);
    });

    controller.query(function (request, response, next) {
      request.baucis.query.populate('fences');
      next();
    });

To add middleware that applies only to specific HTTP methods, use the second form.  It adds a paramater that must contain a space delimted list of HTTP methods that the middleware should be applied to.

    controller.query('head get', function (request, response, next) {
      request.baucis.query.limit(5);
      next();
    });

The final form is the most specific.  The first argument lets you specify whether the middleware applies to document instances (paths like `/cheeses/:id`) or to collection requests (paths like `/cheeses`).

    controller.request('instance', 'head get del', middleware);
    controller.request('collection', 'post', middleware);

## Swagger

Here's how to use swagger.  First, install the plugin:

    npm install --save baucis-swagger

Next, download the [swagger-ui](https://github.com/wordnik/swagger-ui) client.

    git clone git@github.com:wordnik/swagger-ui.git
    open swagger-ui/dist/index.html

Then, create your API as normal, but be sure to require `baucis-swagger`.

    var baucis = require('baucis');
    var swagger = require('baucis-swagger');
    app.use('/api', baucis());

Point the swagger client at your API:

    http://localhost:8012/api/api-docs

Now you have documentation and a test client!

To customize the swagger definition, simply alter the controler's swagger data directly:

    var controller = baucis.rest('sauce');

    controller.swagger.apis.push({
      'path': '/sauces/awesome',
      'description': 'Awesome sauce.',
      'operations': [
        {
          'httpMethod': 'GET',
          'nickname': 'getAwesomeSauce',
          'responseClass': 'Sauce',
          'summary': 'Carolina BBQ Sauce.'
        }
      ]
    });

## HTTP Headers

### Request

| Header Field | Notes |
| ------------ | ----- |
| API-Version | Set this to a valid semver range to request a specific version or range of versions for the requested controller. |
| X-Baucis-Update-Operator | Use this to perform updates (that **BYPASS VALIDATION**) using a special update operator such as `$set`, `$push`, or `$pull`.  The fields that may be updated must be whitelisted per controller.

### Response


| Header Field | Notes |
| ------------ | ----- |
| ETag | Used for HTTP caching based on response body.  Supported automatically for single object endpoints. |
| Last-Modified | Used for HTTP caching.  Can be set automatically by Baucis for single object endpoints.
| Accept | Set to `application/json` for all responses. |
| Allow | Set automatically, correctly removing HTTP methods when those methods have been disabled. |
| Location | Set to the URL of the created/edited entity for PUT and POST responses. |
| Link | Optionally, baucis can add related links to the header for you.  Especially useful for paging through a query.  `first`, `last`, `next`, and `previous` links are added when paging through a collection when using the `limit` & `skip` query options. |

## Query Options

Use query options from the client to make dynamic requests.  Query options can be mixed as you see fit.

### conditions

Set the Mongoose query's `find` or `remove` arguments.  This can take full advtange of the MongoDB query syntax, using geolocation, regular expressions, or full text search.  Special query operators are fine, and in fact geolocation, regular expression, and full text search capabilities are available to your API clients by default!

    GET /api/people?conditions={ "location": { "$near": [44, -97] } }
    GET /api/people?articles={ "summary": { "$text": "dog bites man" } }
    GET /api/cats?sort=-name&limit=1&conditions={ "features": "stripes" }
    DELETE /api/people?conditions={ "name": { "$regex": "^Bob W", $flags: "i" } }

### skip

Skip sending the first *n* matched documents in the response.  Useful for paging.

    GET /api/horses?skip=3

### limit

Limit the response document count to *n* at maximum.

    GET /api/horses?limit=3

If both limit and skip are used on a request, the response `Link` header will be set with extra relations that give URLs for paging.

### sort

Sort response documents by the given criteria. Here's how you'd sort the collection by `name` in ascending order, then by `age` in descending order.

    GET /api/cheeses?sort=name -age

### select

Set which fields should be selected for response documents.

    GET /api/phones?select=-_id -year

It is not permitted to use the `select` query option to select deselected paths.  This is to allow a mechanism for hiding fields from client software.

You can deselect paths in the Mongoose schema definition using `select: false` or in the controller by calling e.g. `controller.select('-foo')`.  Your server middleware will be able to select these fields as usual using `query.select`, while preventing the client from selecting the field.

### populate

Set which fields should be populated for response documents.  See the Mongoose [population documentation](http://mongoosejs.com/docs/populate.html) for more information.  The string or object syntax can be used:

    GET /api/boats?populate=captain
    GET /api/cities?populate={ "path": "captain", "match": { "age": "44" } }

The `select` option of `populate` is disallowed.  Only paths deselected at the model level will be deselected in populate queries.

### count

May be set to true for GET requests to specify that a count should be returned instead of documents

    GET /api/stereos?count=true

### distinct

Set to a path name to retrieve an array of distinct values.

    GET /api/restaurants?distinct=category

### hint

Add an index hint to the query (must be enabled per controller).

    GET /api/pools?hint={ name: 1 }

### comment

Add a comment to a query (must be enabled per controller).

    GET /api/wrenches?comment=Something informative

## Errors & Status Codes

Baucis supports a rich array of error responses and status codes. For more information on status codes see [RFC2616](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) the HTTP sepcification.

### 4xx

4xx status codes mean that the client, for example a web browser made a mistake an needs to fix the response.

#### 400 Bad Request

The client made a bad request and should fix the request before trying again.  This is also sent when a deprecated command is used.

    baucis.Error.BadRequest
    baucis.Error.Deprecated

#### 403 Forbidden

Sent when the requested action is disallowed for a controller.

    baucis.Error.Forbidden;

#### 404 Not Found

Sent when the query does not match any document, or when the requested resource does not exist.

    baucis.Error.NotFound

#### 405 Method Not Allowed

The request HTTP method (i.e one of `HEAD`, `GET`, `POST`, `PUT`, `DELETE`) is disabled for this resource.  This can be done by e.g. `controller.methods('post put del', false)`.

    baucis.Error.MethodNotAllowed

#### 406 Not Acceptable

The `Accept` header specified in the request could not be fulfilled.  By default JSON is supported.  Baucis is pluggable to allow adding formatters for additional content types.

    baucis.Error.NotAcceptable

#### 409 Conflict

If a controller has optimistic locking enabled, baucis will automatically check each updated document's version and give a 409 error if another API client modified the document before the requester was able to send their update.

In this case, a client could reload the document, present the user with a description of the conflict, and ask them how to procede.

    baucis.Error.LockConflict

#### 415 Unspported Media Type

The request body content type was not able to be parsed.  By default JSON is supported.  Baucis is pluggable to allow adding parsers for additional content types.

    baucis.Error.UnsupportedMediaType

#### 422 Unprocessable Entity

This status indicates a validation error ocurred, or that the entity sent to the server was invalid semantically in another way.

    baucis.Error.ValidationError

Baucis will send a response body with error 422 that indicates what validation failed for which fields.

      {
        "name": {
          "message": "Path `name` is required.",
          "name": "ValidatorError",
          "path": "name",
          "type": "required"
        },
        "score": {
          "message": "Path `score` (-1) is less than minimum allowed value (1).",
          "name": "ValidatorError",
          "path": "score",
          "type": "min",
          "value": -1);
        }
      }

Technically, this error is from [RFC4918](https://tools.ietf.org/html/rfc4918#section-11.2), the WebDAV specification.


### 5xx

Where as `4xx` errors mean the requester messed up, `5xx` errors mean the server messed up :)

#### 500 Internal Server Error

This means that baucis is misconfigured, or that the server tried to perform the requested action but failed.

    baucis.Error.Configuration

#### 501 Not Implemented

The requested functionality is not implemented now, but may be implented in the future.

    baucis.Error.NotImplemented
    
## Roadmap

### Q2 2014

 * v1.0.0 Release candidates
 * Improve documentation
 * Begin a cookbook-style guide with lots of code examples.
 * v1.0.0
 * Express 4


## Plugins

 * [baucis-swagger](https://www.npmjs.org/package/baucis-swagger)
 * [bswagger](https://www.npmjs.org/package/bswagger)
 * [baucis-gform](https://www.npmjs.org/package/baucis-gform)
 * [baucis-patch](https://www.npmjs.org/package/baucis-patch)
 * [baucis-json](https://www.npmjs.org/package/baucis-json)

The `baucis-json` plugin is bundled with baucis by default.  It's a good example for writing your own plugins, and for parsing or outputting custom content types.


##Contact


 * @wprl
 * https://linkedin.com/in/willprl
 * william@kun.io

&copy; 2012-2014 William P. Riley-Land
