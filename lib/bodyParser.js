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

var Stream = require('stream');
var JSONStream = require('JSONStream');
var RestError = require('restify-errors');
var Restify = require('restify');
var async = require('async');
var _ = require('lodash');

module.exports = function (options) {
    
    options = _.defaults(options || {}, {
        enable: false,
        pattern: '*',
        default: {
            mapParams: false
        }
    });
    
    return function (req, res, next) {
        var config = req.route ? req.route.streamer : undefined;
        
        if (!config || config.enable === false) {
            async.eachSeries(Restify.bodyParser(options.default), function(fn, cb) {
                fn(req, res, cb);
            }, next);
        } else {
            if(/.+[\/\+]json$/i.test(req.contentType())) {
                req.body = req
                .pipe(JSONStream.parse(config.pattern))
            } else {
                req.body = req;
            }
            next();
        }
    };
};