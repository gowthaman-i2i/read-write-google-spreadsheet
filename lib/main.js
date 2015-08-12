var Spreadsheet = require('edit-google-spreadsheet');
var _ = require('underscore');
var async = require('async');
/*
 *This method used to get spreadsheet header(Keys) and rows(values) 
 * and construct the array of json objects
 */

function _constructJsonObj(keys, values) {
  var jsonDatas = [];
  if (values) {
    _.each(values, function(value, key) {
      var obj = {};
      _.each(keys, function(key, $index) {
        obj[key.toString()] = _.propertyOf(value)(($index + 1).toString()) || null;
      });
      obj.row = key
      jsonDatas.push(obj);
    })
  }
  return jsonDatas;
}

/*
 * This method used to construct spreadsheet object
 * @params(spreadsheet header, input object)
 * @return{ row : {
              column1 : value,
              column2 : value,
              column3 : value,
              column4 : value,
              column5 : value,
           } }
 */
function _constructSpreadSheetObj(rows, params) {
  var obj = {};

  var rowHeader = _.chain(rows)
    .pick(rows, 1)
    .values(rows)
    .value()[0];

  _.mapObject(rowHeader, function(val, key) {
    if (params[val]) {
      obj[key] = params[val];
    }
  });

  return obj;
}

/*
  This method used to Using spreadsheet header(Keys) and rows(values) 
   construct the array of json objects
*/
function _getHeaderRow(rows) {
  //get first row(header) using _pick
  var fields = _.chain(rows)
    .pick(rows, 1)
    .values(rows)
    .value()[0];
  fields = _.values(fields);
  return fields;
}

var MySpreadsheet = function(opts) {
  this.opts = opts;
}


/*
 * Initate the Spreadsheet
 */
MySpreadsheet.prototype.init = function(callback) {
  Spreadsheet.load(this.opts, callback);
};

/*
 *
 */
MySpreadsheet.prototype.sheetReady = function(callback) {
  this.init(callback)
};
/*
 *
 */
MySpreadsheet.prototype.sheetReceive = function(callback) {
  this.sheetReady(function(err, spreadsheet) {
    if (err) throw err;
    spreadsheet.receive(callback);
  })
};

/*
 *This method used to find header from spreadsheet
 */
MySpreadsheet.prototype.getHeader = function(callback) {
  this.sheetReceive(function(err, rows, info) {
    callback(err, _getHeaderRow(rows))
  });
};


/*
 * This Method used to read spreadSheet  
 * and construct array of json
 * callback() retrun array of json
 */
MySpreadsheet.prototype.getAllRows = function(callback) {
  this.sheetReceive(function(err, rows, info) {
    if (err) throw err;
    var datas = _.omit(rows, 1); //remove first row(header) using _omit
    callback(null, _constructJsonObj(_getHeaderRow(rows), datas));
  });

};

/*
 * This Method used to read spreadSheet and filter by  Constraints
 * Looks through each value in the rows, returning an array of all the values that contain all of the key-value pairs listed in properties.
 */
MySpreadsheet.prototype.getRowsByConstraints = function(properties, callback) {
  this.getRows(function(err, result) {
    callback(null, _.where(result, properties));
  })
};

/*
 * This Method used to read spreadSheet and filter by  value
 * Looks through the rows and returns the first value that matches all of the key-value pairs listed in properties
 */

MySpreadsheet.prototype.getRowByValue = function(property, callback) {
  this.getAllRows(function(err, result) {
    callback(err, _.findWhere(result, property));
  })
}

MySpreadsheet.prototype.insert = function(params, callback) {
  this.sheetReady(function(err, spreadsheet) {
    spreadsheet.add(params);
    spreadsheet.send(function(err, result) {
      callback(err, "Spreadsheet updated successfully");
    });

  });
};

MySpreadsheet.prototype.addNewRow = function(params, callback) {
  var _self = this;
  this.sheetReceive(function(err, rows, info) {
    var row = {};
    row[info.nextRow] = _constructSpreadSheetObj(rows, params);
    _self.insert(row, callback)
  })
};

MySpreadsheet.prototype.updateRow = function(params, callback) {
  var _self = this;
  if (params.row) {
    async.waterfall([
      function(callback) {
        _self.getRowByValue({ row : params.row}, callback);
      },
      function(result, callback) {
        var rs = _.extend(result, params);
        _self.sheetReceive(function(err, rows, info) {
           var row = {};
         row[rs.row] = _constructSpreadSheetObj(rows, rs);
            _self.insert(row, callback)
        });
      },
    ],callback);
  } else {
     callback("property row is required", params);
  }
};
 
module.exports = MySpreadsheet;
