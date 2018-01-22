/*
var Packages = [{
		"id" : "TestPackage-1",
		"created" : "2015-05-15T21:50:15Z",
		"updated" : "2015-05-15T21:50:15Z",
		"name" : "com.eastbay.qaautomation.testcases.registration",
		"testClassIds" : ["TestClass-1", "TestClass-2"]
	}, {
		"id" : "TestPackage-2",
		"created" : "2015-05-18T20:55:47Z",
		"updated" : "2015-05-18T20:55:47Z",
		"name" : "com.eastbay.qaautomation.testcases.login",
		"testClassIds" : ["TestClass-1", "TestClass-2"]
	}
];
var Classes = [{
		"Id" : "1",
		"Name" : "Class1"
	}, {
		"Id" : "2",
		"Name" : "Class2"
	}, {
		"Id" : "3",
		"Name" : "Class3"
	}, {
		"Id" : "4",
		"Name" : "Class4"
	}, {
		"Id" : "5",
		"Name" : "Class5"
	}
];
var Methods = [{
		"Id" : "1",
		"Name" : "Method1",
		"TestParameters" : [{
				"Id" : "1",
				"Name" : "Param1",
				"DataType" : "String",
				"Ordinal" : "1"
			}, {
				"Id" : "2",
				"Name" : "Param2",
				"DataType" : "String",
				"Ordinal" : "2"
			}, {
				"Id" : "3",
				"Name" : "Param3",
				"DataType" : "String",
				"Ordinal" : "3"
			}, {
				"Id" : "4",
				"Name" : "Param4",
				"DataType" : "String",
				"Ordinal" : "4"
			}, {
				"Id" : "5",
				"Name" : "Param5",
				"DataType" : "String",
				"Ordinal" : "5"
			}
		]
	}, {
		"Id" : "2",
		"Name" : "Method2",
		"TestParameters" : [{
				"Id" : "6",
				"Name" : "Param1",
				"DataType" : "String",
				"Ordinal" : "1"
			}, {
				"Id" : "7",
				"Name" : "Param2",
				"DataType" : "String",
				"Ordinal" : "2"
			}, {
				"Id" : "8",
				"Name" : "Param3",
				"DataType" : "String",
				"Ordinal" : "3"
			}, {
				"Id" : "9",
				"Name" : "Param4",
				"DataType" : "String",
				"Ordinal" : "4"
			}, {
				"Id" : "10",
				"Name" : "Param5",
				"DataType" : "String",
				"Ordinal" : "5"
			}
		]
	}, {
		"Id" : "3",
		"Name" : "Method3",
		"TestParameters" : [{
				"Id" : "11",
				"Name" : "Param1",
				"DataType" : "String",
				"Ordinal" : "1"
			}, {
				"Id" : "12",
				"Name" : "Param2",
				"DataType" : "String",
				"Ordinal" : "2"
			}, {
				"Id" : "13",
				"Name" : "Param3",
				"DataType" : "String",
				"Ordinal" : "3"
			}, {
				"Id" : "14",
				"Name" : "Param4",
				"DataType" : "String",
				"Ordinal" : "4"
			}, {
				"Id" : "15",
				"Name" : "Param5",
				"DataType" : "String",
				"Ordinal" : "5"
			}
		]
	}, {
		"Id" : "4",
		"Name" : "Method4",
		"TestParameters" : [{
				"Id" : "16",
				"Name" : "Param1",
				"DataType" : "String",
				"Ordinal" : "1"
			}, {
				"Id" : "17",
				"Name" : "Param2",
				"DataType" : "String",
				"Ordinal" : "2"
			}, {
				"Id" : "18",
				"Name" : "Param3",
				"DataType" : "String",
				"Ordinal" : "3"
			}, {
				"Id" : "19",
				"Name" : "Param4",
				"DataType" : "String",
				"Ordinal" : "4"
			}, {
				"Id" : "20",
				"Name" : "Param5",
				"DataType" : "String",
				"Ordinal" : "5"
			}
		]
	}, {
		"Id" : "5",
		"Name" : "Method5",
		"TestParameters" : [{
				"Id" : "21",
				"Name" : "Param1",
				"DataType" : "String",
				"Ordinal" : "1"
			}, {
				"Id" : "22",
				"Name" : "Param2",
				"DataType" : "String",
				"Ordinal" : "2"
			}, {
				"Id" : "23",
				"Name" : "Param3",
				"DataType" : "String",
				"Ordinal" : "3"
			}, {
				"Id" : "24",
				"Name" : "Param4",
				"DataType" : "String",
				"Ordinal" : "4"
			}, {
				"Id" : "25",
				"Name" : "Param5",
				"DataType" : "String",
				"Ordinal" : "5"
			}
		]
	}
];
var Method = {
	"Id" : "1",
	"Name" : "Method1",
	"TestParameters" : [{
			"Id" : "1",
			"Name" : "Param1",
			"DataType" : "String",
			"Ordinal" : "1"
		}, {
			"Id" : "2",
			"Name" : "Param2",
			"DataType" : "String",
			"Ordinal" : "2"
		}, {
			"Id" : "3",
			"Name" : "Param3",
			"DataType" : "String",
			"Ordinal" : "3"
		}, {
			"Id" : "4",
			"Name" : "Param4",
			"DataType" : "String",
			"Ordinal" : "4"
		}, {
			"Id" : "5",
			"Name" : "Param5",
			"DataType" : "String",
			"Ordinal" : "5"
		}
	]
};
var Samples = [{
		"Id" : "1",
		"Name" : "Samples1",
		"Ordinal" : "1",
		"TestCaseSampleParameters" : [{
				"Id" : "Long",
				"Name" : "String",
				"Value" : "String",
				"DataType" : "String",
				"Ordinal" : "Integer"
			}
		]
	}, {
		"Id" : "2",
		"Name" : "Samples2",
		"Ordinal" : "2",
		"TestCaseSampleParameters" : [{
				"Id" : "Long",
				"Name" : "String",
				"Value" : "String",
				"DataType" : "String",
				"Ordinal" : "Integer"
			}
		]
	}, {
		"Id" : "3",
		"Name" : "Samples3",
		"Ordinal" : "3",
		"TestCaseSampleParameters" : [{
				"Id" : "1",
				"Name" : "someString",
				"Value" : "This awesome thing",
				"DataType" : "String",
				"Ordinal" : "1"
			}, {
				"Id" : "2",
				"Name" : "userAccount",
				"Value" : {
					"Username" : "user1@example.com",
					"Password" : "foo123"
				},
				"DataType" : "User",
				"Ordinal" : "2"
			}, {
				"Id" : "3",
				"Name" : "expectedCondition",
				"Value" : [{
						"Foobarbaz" : "Foo bar baz"
					}, {
						"Barbazfoo" : "Bar baz foo"
					}, {
						"Bazfoobar" : "Baz foo bar"
					}
				],
				"DataType" : "Map<String, String>",
				"Ordinal" : "3"
			}
		]
	}, {
		"Id" : "4",
		"Name" : "Samples4",
		"Ordinal" : "4",
		"TestCaseSampleParameters" : [{
				"Id" : "Long",
				"Name" : "String",
				"Value" : "String",
				"DataType" : "String",
				"Ordinal" : "Integer"
			}
		]
	}, {
		"Id" : "5",
		"Name" : "Samples5",
		"Ordinal" : "5",
		"TestCaseSampleParameters" : [{
				"Id" : "Long",
				"Name" : "String",
				"Value" : "String",
				"DataType" : "String",
				"Ordinal" : "Integer"
			}
		]
	}
];
var Sample = {
	"Id" : "1",
	"Name" : "Samples1",
	"Ordinal" : "1",
	"TestCaseSampleParameters" : [{
			"Id" : "Long",
			"Name" : "String",
			"Value" : "String",
			"DataType" : "String",
			"Ordinal" : "Integer"
		}
	]
};

$.ajax = function (param) {
	var deferred = $.Deferred();
	var _mockOptions = param;
	var endPoint = param.url.split('/')[4];
	switch (endPoint) {
	case 'testpackages':
		deferred.resolve(Packages);
		break;
	case 'testclasses':
		deferred.resolve(Classes);
		break;
	case 'testmethods':
		deferred.resolve(Methods);
		break;
	case 'testmethod':
		var id = param.url.split('?')[1].split('=')[1];
		for (var i = 0; i < Methods.length; i++) {
			if (Methods[i].Id === id) {
				deferred.resolve(Methods[i]);
			}
		}
		break;
	case 'testcasesamples':
		deferred.resolve(Samples);
		break;
	case 'testcasesample':
		var id = param.url.split('?')[1].split('=')[1];
		for (var i = 0; i < Samples.length; i++) {
			if (Samples[i].Id === id) {
				deferred.resolve(Samples[i]);
			}
		}
		break;
	}
	//console.log('AJAX Mock for: ' + endPoint);
	return deferred.promise();
}*/
var Documents = [
{
	"key" : "QaAutomation-com.eastbay.qaautomation.testcases.registration-TestClass1-TestMethod1",
	"modelType" : "Testcase",
	"createdDate" : "0000-00-00T00:00:00Z",
	"modifiedDate" : "0000-00-00T00:00:00Z",
	
	
	"packageName" : "com.eastbay.qaautomation.testcases.registration",
	"className" : "TestClass1",
	"methodName" : "TestMethod1",
	
	"parameters" : [
			{
				"name" : "someString",
				"dataType" : {"name":"String", "displayName":"String"},
				"ordinal" : "1"
			},
			{
				"name" : "someOtherString",
				"dataType" : {"name":"String", "displayName":"String"},
				"ordinal" : "2"
			},
			{
				"name" : "someNumber",
				"dataType" : {"name":"Integer", "displayName":"Integer"},
				"ordinal" : "3"
			},
			{
				"name" : "expectedConditions",
				"dataType" : {"name":"Map<String, String>", "displayName":"Assertion"},
				"ordinal" : "4"
			}
	],
	
	"samples" : [{
			"name" : "Sample1",
			"ordinal" : "1",
			"arguments" : [{
					"value" : "This awesome thing",
					"ordinal" : "1"
				},
				{
					"value" : "This other awesome thing",
					"ordinal" : "2"
				},
				{
					"value" : "42",
					"ordinal" : "3"
				},
				{
					"value" : [{"Foobarbaz" : "Foo bar baz"},
							   {"Barbazfoo" : "Bar baz foo"},
							   {"Bazfoobar" : "Baz foo bar"	}
					],
					"ordinal" : "4"
				}
			]
		}
	]
},
{
	"key" : "QaAutomation-com.eastbay.qaautomation.testcases.registration-TestClass1-TestMethod2",
	"modelType" : "Testcase",
	"createdDate" : "0000-00-00T00:00:00Z",
	"modifiedDate" : "0000-00-00T00:00:00Z",
	
	
	"packageName" : "com.eastbay.qaautomation.testcases.registration",
	"className" : "TestClass1",
	"methodName" : "TestMethod2",
	
	"parameters" : [
			{
				"name" : "someString",
				"dataType" : {"name":"String", "displayName":"String"},
				"ordinal" : "1"
			},
			{
				"name" : "someOtherString",
				"dataType" : {"name":"String", "displayName":"String"},
				"ordinal" : "2"
			},
			{
				"name" : "someNumber",
				"dataType" : {"name":"Integer", "displayName":"Integer"},
				"ordinal" : "3"
			},
			{
				"name" : "expectedConditions",
				"dataType" : {"name":"Map<String, String>", "displayName":"Assertion"},
				"ordinal" : "4"
			}
	],
	
	"samples" : [{
			"name" : "Sample1",
			"ordinal" : "1",
			"arguments" : [{
					"value" : "This awesome thing",
					"ordinal" : "1"
				},
				{
					"value" : "This other awesome thing",
					"ordinal" : "2"
				},
				{
					"value" : "42",
					"ordinal" : "3"
				},
				{
					"value" : [{"Foobarbaz" : "Foo bar baz"},
							   {"Barbazfoo" : "Bar baz foo"},
							   {"Bazfoobar" : "Baz foo bar"	}
					],
					"ordinal" : "4"
				}
			]
		},
		{
			"name" : "Sample2",
			"ordinal" : "2",
			"arguments" : [{
					"value" : "This awesome thing",
					"ordinal" : "1"
				},
				{
					"value" : "This other awesome thing",
					"ordinal" : "2"
				},
				{
					"value" : "42",
					"ordinal" : "3"
				},
				{
					"value" : [{"Foobarbaz" : "Foo bar baz"},
							   {"Barbazfoo" : "Bar baz foo"},
							   {"Bazfoobar" : "Baz foo bar"	}
					],
					"ordinal" : "4"
				}
			]
		}
	]
},
{
	"key" : "QaAutomation-com.eastbay.qaautomation.testcases.login-TestClass1-TestMethod1",
	"modelType" : "Testcase",
	"createdDate" : "0000-00-00T00:00:00Z",
	"modifiedDate" : "0000-00-00T00:00:00Z",
	
	
	"packageName" : "com.eastbay.qaautomation.testcases.login",
	"className" : "TestClass1",
	"methodName" : "TestMethod1",
	
	"parameters" : [
			{
				"name" : "someString",
				"dataType" : {"name":"String", "displayName":"String"},
				"ordinal" : "1"
			},
			{
				"name" : "someOtherString",
				"dataType" : {"name":"String", "displayName":"String"},
				"ordinal" : "2"
			},
			{
				"name" : "someNumber",
				"dataType" : {"name":"Integer", "displayName":"Integer"},
				"ordinal" : "3"
			},
			{
				"name" : "expectedConditions",
				"dataType" : {"name":"Map<String, String>", "displayName":"Assertion"},
				"ordinal" : "4"
			}
	],
	
	"samples" : [{
			"name" : "Sample1",
			"ordinal" : "1",
			"arguments" : [{
					"value" : "This awesome thing",
					"ordinal" : "1"
				},
				{
					"value" : "This other awesome thing",
					"ordinal" : "2"
				},
				{
					"value" : "42",
					"ordinal" : "3"
				},
				{
					"value" : [{"Foobarbaz" : "Foo bar baz"},
							   {"Barbazfoo" : "Bar baz foo"},
							   {"Bazfoobar" : "Baz foo bar"	}
					],
					"ordinal" : "4"
				}
			]
		}
	]
},
{
	"key" : "QaAutomation-com.eastbay.qaautomation.testcases.login-TestClass2-TestMethod1",
	"modelType" : "Testcase",
	"createdDate" : "0000-00-00T00:00:00Z",
	"modifiedDate" : "0000-00-00T00:00:00Z",
	
	
	"packageName" : "com.eastbay.qaautomation.testcases.login",
	"className" : "TestClass2",
	"methodName" : "TestMethod1",
	
	"parameters" : [
			{
				"name" : "someString",
				"dataType" : {"name":"String", "displayName":"String"},
				"ordinal" : "1"
			},
			{
				"name" : "someOtherString",
				"dataType" : {"name":"String", "displayName":"String"},
				"ordinal" : "2"
			},
			{
				"name" : "someNumber",
				"dataType" : {"name":"Integer", "displayName":"Integer"},
				"ordinal" : "3"
			},
			{
				"name" : "expectedConditions",
				"dataType" : {"name":"Map<String, String>", "displayName":"Assertion"},
				"ordinal" : "4"
			}
	],
	
	"samples" : [{
			"name" : "Sample1",
			"ordinal" : "1",
			"arguments" : [{
					"value" : "This awesome thing",
					"ordinal" : "1"
				},
				{
					"value" : "This other awesome thing",
					"ordinal" : "2"
				},
				{
					"value" : "42",
					"ordinal" : "3"
				},
				{
					"value" : [{"Foobarbaz" : "Foo bar baz"},
							   {"Barbazfoo" : "Bar baz foo"},
							   {"Bazfoobar" : "Baz foo bar"	}
					],
					"ordinal" : "4"
				}
			]
		}
	]
}
];

$.ajax = function (param) {
	var deferred = $.Deferred();
	var _mockOptions = param;
	var endPoint = param.url.split('/')[4];
	switch (endPoint) {
	case 'testpackages':
		switch (param.method) {
			case 'POST' :
				var newDoc = {
					"key" : "QaAutomation-",
					"modelType" : "Testcase",
					"createdDate" : "0000-00-00T00:00:00Z",
					"modifiedDate" : "0000-00-00T00:00:00Z",
					
					
					"packageName" : param.data.packageName,
					"className" : "",
					"methodName" : "",
					
					"parameters" : [],	
					"samples" : []
				}
				Documents.push(newDoc);
				deferred.resolve();
				return deferred.promise();
			break;
			case 'PUT' :
				var id = param.url.split('?')[1].split('=')[1];
				for (var i = 0; i < Documents.length; i++) {
					if (Documents[i].packageName === id) {
						Documents[i].packageName = param.data.packageName;
						deferred.resolve();
						return deferred.promise();
					}
				}
			break;
			case 'DELETE' :
				var id = param.url.split('?')[1].split('=')[1];
				for (var i = 0; i < Documents.length; i++) {
					if (Documents[i].packageName === id) {
						Documents.splice(i, 1);
						deferred.resolve();
						return deferred.promise();
					}
				}
			break;
			case 'GET' :
			default :
				var Packages = [];
				for (var i = 0; i < Documents.length; i++) {
					if($.inArray(Documents[i].packageName, Packages) < 0) {
						Packages.push(Documents[i].packageName);
					}						
				}
				deferred.resolve(Packages);
				return deferred.promise();
			break;
		}
		break;
	case 'testclasses':
		switch (param.method) {
			case 'POST' :
				var id = param.url.split('?')[1].split('=')[1];
				for (var i=0; i<Documents.length; i++) {
					if (Documents[i].packageName === id && Documents[i].className === '') {
						Documents[i].className = param.data.className;
						deferred.resolve();
						return deferred.promise();
					}
				}
				if (i >= Documents.length) {
					var newDoc = {
						"key" : "QaAutomation-",
						"modelType" : "Testcase",
						"createdDate" : "0000-00-00T00:00:00Z",
						"modifiedDate" : "0000-00-00T00:00:00Z",
						
						
						"packageName" : id,
						"className" : param.data.className,
						"methodName" : "",
						
						"parameters" : [],	
						"samples" : []
					}
					Documents.push(newDoc);
				}
				deferred.resolve();
				return deferred.promise();
			break;
			case 'PUT' :
				var ids = param.url.split('?')[1].split('&');
				var packageName = ids[0].split('=')[1];
				var className = ids[1].split('=')[1];
				for (var i = 0; i < Documents.length; i++) {
					if (Documents[i].packageName === packageName && Documents[i].className === className) {
						Documents[i].className = param.data.className;
						deferred.resolve();
						return deferred.promise();
					}
				}
			break;
			case 'DELETE' :
				var ids = param.url.split('?')[1].split('&');
				var packageName = ids[0].split('=')[1];
				var className = ids[1].split('=')[1];
				for (var i = 0; i < Documents.length; i++) {
					if (Documents[i].packageName === packageName && Documents[i].className === className) {
						Documents.splice(i, 1);
						deferred.resolve();
						return deferred.promise();
					}
				}
			break;
			case 'GET' :
			default :
				var Classes = [];
				var id = param.url.split('?')[1].split('=')[1];
				for (var i = 0; i < Documents.length; i++) {
				  if (Documents[i].packageName === id) {
					if($.inArray(Documents[i].className, Classes) < 0 && Documents[i].className !== '') {
						Classes.push(Documents[i].className);
					}						
				  }
				}
				deferred.resolve(Classes);
				return deferred.promise();
			break;
		}
		deferred.resolve(Classes);
		return deferred.promise();
		break;
	case 'testmethods':
		switch (param.method) {
			case 'GET' :
			default :
				var Methods = [];
				var ids = param.url.split('?')[1].split('&');
				var packageName = ids[0].split('=')[1];
				var className = ids[1].split('=')[1];
				for (var i = 0; i < Documents.length; i++) {
				  if (Documents[i].packageName === packageName && Documents[i].className === className) {
					if($.inArray(Documents[i].methodName, Methods) < 0 && Documents[i].methodName !== '') {
						Methods.push(Documents[i].methodName);
					}						
				  }
				}
				deferred.resolve(Methods);
				return deferred.promise();
			break;
		}
		deferred.resolve(Methods);
		return deferred.promise();
		break;
	case 'testmethod':
		var id = param.url.split('?')[1].split('=')[1];
		for (var i = 0; i < Methods.length; i++) {
			if (Methods[i].Id === id) {
				deferred.resolve(Methods[i]);
				return deferred.promise();
			}
		}
		break;
	case 'testcasesamples':
		deferred.resolve(Samples);
		break;
	case 'testcasesample':
		var id = param.url.split('?')[1].split('=')[1];
		for (var i = 0; i < Samples.length; i++) {
			if (Samples[i].Id === id) {
				deferred.resolve(Samples[i]);
				return deferred.promise();
			}
		}
		break;
	default:
		if (endPoint.search(/QaAutomation-/g) >= 0) {
			var node = param.url.split('/')[5];
			switch (node) {
				case 'samples':
					switch (param.method) {
						case 'PUT':
						case 'POST':
						case 'DELETE':
							for (var i=0; i<Documents.length; i++) {
								if (Documents[i].key === endPoint) {
									Documents[i].samples = param.data.samples;
									deferred.resolve();
									return deferred.promise();
								}
							}
						break;
					}
				break;
				case 'method':
				 switch (param.method) {
					 case 'PUT':
						for (var i=0; i<Documents.length; i++) {
							if (Documents[i].key === endPoint) {
								Documents[i].methodName = param.data.methodName;
								Documents[i].parameters = param.data.parameters;
								deferred.resolve();
								return deferred.promise();
							}
						}
					 break;
					 case 'DELETE':
					 case 'POST':
						for (var i=0; i<Documents.length; i++) {
							if (Documents[i].key === endPoint) {
								Documents[i].parameters = param.data.parameters;
								deferred.resolve();
								return deferred.promise();
							}
						}
					 break;
				 }
				break;
				default:
					switch (param.method) {
						case 'POST' :
							var ids = endPoint.split('-');
							var packageName = ids[1];
							var className = ids[2];
							var methodName = ids[3];
							for (var i=0; i<Documents.length; i++) {
								if (Documents[i].packageName === packageName && Documents[i].className === className &&
									Documents[i].methodName === '') {
										
									Documents[i].methodName = methodName;
									deferred.resolve();
									return deferred.promise();
								}
							}
							if (i >= Documents.length) {
								var newDoc = {
									"key" : "QaAutomation-",
									"modelType" : "Testcase",
									"createdDate" : "0000-00-00T00:00:00Z",
									"modifiedDate" : "0000-00-00T00:00:00Z",
									
									
									"packageName" : packageName,
									"className" : className,
									"methodName" : methodName,
									
									"parameters" : [],	
									"samples" : []
								}
								newDoc.key += packageName +"-"+ className +"-"+ methodName
								Documents.push(newDoc);
							}
							deferred.resolve();
							return deferred.promise();
						break;
						case 'DELETE' :
							for (var i = 0; i < Documents.length; i++) {
								if (Documents[i].key === endPoint) {
									Documents.splice(i, 1);
									deferred.resolve();
								}
							}
						break;
						case 'GET' :
							var Method = null;
							var id = endPoint;
							for (var i = 0; i < Documents.length; i++) {
							  if (Documents[i].key === id) {
									Method = Documents[i];
							  }						
							}
							deferred.resolve(Method);
							return deferred.promise();
						break;
					}
				break;
			}
		}
	break;
	}
	//console.log('AJAX Mock for: ' + endPoint);
	return deferred.promise();
}
