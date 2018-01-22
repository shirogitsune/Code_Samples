#Single Page Angular/Node Application

This is a version of the demo written entirely using Node.JS and Angular.JS and provides a frontend UI for interacting with API services. 
Most of the interactions are handled entirely through Angular with Node being leveraged for docker to talk to and setting up some backend components as well as autheticating users via the API.

##Installation
Installation of the application can be accomplished by executing the following command:
```
$ npm install
```
This will install the relevant dependencies for running the application.

##Running the application
To run the application, enter the following at the prompt:
```
$ npm start
```
This will load the applciation using the parameters defined in the `config.js` file. Alternatively, the application can be run directly from Node. This also allows for the some of the configuration defaults to be overridden.
The can be accomplished by entering the following:
```
$ node index --port=8086 --serviceport=8085 --secret=somerandomvalue
```
The argments for port, serviceport and secret are optional.
* `--port`: This specifies the port that the application listens on.
* `--serviceport`: This specified what port to set for the UI to make API calls to.
* `--secret`: The specifies the session secret to be used for the lifetime of this applcation.

##Unit tests
All portions of the UI application that perform work have unit tests associated with those program units. These tests are accessible from the `tests` directory by opening the `SpecRunner.html` file in the `tests` directory. This will execute all the provided unit tests and display the results of those tests in the browser window.