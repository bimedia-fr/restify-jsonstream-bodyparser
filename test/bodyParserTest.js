/* 
 * The MIT License
 *
 * Copyright 2015 Guillaume Chauvet
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

var test = require('unit.js');
var restify = require('restify');
var bodyParser = require('../lib/bodyParser');
var request = require('supertest');
var es = require('event-stream');

function _expectPayload(payloads) {
    return function (server) {
        if (server.res.statusCode !== 200) {
            throw JSON.stringify(server.res.body);
        } else {
            server.req.pipe(es.writeArray(function (err, content) {
                test.assert.ifError(err);
                test.object(content).is(payloads);
            }));
        }
    };
}

describe("[BODY-PARSER][NEW]", function () {

    var server;

    before(function (done) {
        server = restify.createServer();
        server.use(bodyParser());
        server.listen(0, function() {
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
            server.get({
                url: '/'
            }, function (req, res, next) {
                res.send(200);
                res.end();
            });
            done();
        });
    });

    after(function (done) {
        server.close(done);
    });

    describe("on PUT ", function() {

        it("should handle simple application/json requests", function (done) {
            var payload = [{
                'something': 'foo',
                'yup': 'bar'
            }];

            request(server)
            .post('/')
            .send(payload)
            .expect(_expectPayload(payload))
            .end(done);
        });

        it("should handle long application/json requests", function (done) {
            var payload = [{}];

            for (var i = 0; i < 10000; i++) {
                payload.push({"value" : i });
            }

            request(server)
            .post('/')
            .send(payload)
            .expect(_expectPayload(payload))
            .end(done);
        });

        it("should fail on unvalid JSON", function (done) {
            request(server)
            .post('/')
            .send('{"name"}')
            .type('json')
            .expect('Content-Type', /json$/)
            .expect(500)
            .end(done);
        });
        
        it("should handle an empty stream", function (done) {
            request(server)
            .post('/')
            .type('json')
            .expect('Content-Type', /json$/)
            .expect(200)
            .end(done);
        });

    });
    
    describe("on GET", function() {
    
        it("no behaviour change", function (done) {
            request(server)
            .get('/')
            .expect(200)
            .end(done);
        });

    });
});