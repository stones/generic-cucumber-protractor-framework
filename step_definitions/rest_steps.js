'use strict';
const path = require('path');
const ROOT_PATH = path.resolve('./');
const { Given, When, Then } = require(ROOT_PATH + '/node_modules/cucumber');

const jsonStore = require('../support/json_store');
const stored_data = require('../support/stored_data');
const jsonPath = require('../support/json_path')
const requestPromise = require('request-promise');
const restConfig = require('../support/restConfig');
const request_path = require('../support/request');
const request_payload = require('../support/request_payload');

Given(/^I have a created a "([^"]*)" for "([^"]*)" through the "([^"]*)"$/, function (request_body, request_url, server_name, next) {
    const current_request_url = request_path.getRequestURL(request_url);
    const original_json = request_payload.getRequestPayload(request_body);
    const updated_json = request_path.updateRequest(original_json);
    var expectedStatusCode = parseInt(200);
    requestPromise(restConfig.post(JSON.parse(updated_json), current_request_url, server_name))
        .then(function (response) {
            jsonStore.setJson(response.body);
            response.statusCode.should.equal(expectedStatusCode);
            next();
        },function(err){
            console.log("error", err)
            next()
        });
});


Given(/^I retrieve and store the "(.*)" from "([^"]*)" as "([^"]*)"$/, function (json_path, request, store_name, next) {
    const stored_value_name = json_path.split('{').pop().split('}').shift();
    const current_request = request_path.getRequestURL(request);
    //retrieve stored value based on name between brackets
    if(stored_value_name) {
        const retrieved_stored_value = stored_data.getData(stored_value_name);
        json_path = json_path.replace(/{.*}/, retrieved_stored_value)
    }
    requestPromise(restConfig.get(current_request))
        .then(function (response) {
            response.statusCode.should.equal(200);
            const json_value = jsonPath.getJsonFromPath(json_path, response.body);
            stored_data.setData(store_name, json_value);
            next();
        }).catch(function(err){
        next(err);
    })

});

