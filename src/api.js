// Controller
var DocumentDBClient = require('documentdb').DocumentClient;
var async = require('async');

function DataCenter(taskDao) {
  this.taskDao = taskDao;
}

DataCenter.prototype = {
  get: function(req, res) {
    var self = this;
    var querySpec = {
      query: 'SELECT * FROM root r',
    };
    self.taskDao.find(querySpec, function(err, items) {
      if (err) {
        throw (err);
      }
      if(req.query.ui && req.query.ui === 'true'){
  	    res.render('pages/api', {
            type: req.query.type || 'gemcrush',
            code: 200, 
            data: items
          });
      }else{
        res.send({
            type: req.query.type || 'gemcrush',
            code: 200, 
            data: items
          });
      }
      
    });
  },

  add: function(req, res) {
    var self = this;
    var item = req.body;

    self.taskDao.addItem(item, function(err) {
      if (err) {
        throw (err);
      }
      res.send({
            code: 200, 
            data: item,
            err: err
          });
    });
  },

  update: function(req, res) {
    var self = this;
    var ids = Object.keys(req.body);
    var fields = { 
      field: 'Date',
      data: 'updated'
    };
    async.forEach(ids, function taskIterator(completedTask, callback) {
      self.taskDao.updateItem(ids, fields, function(err) {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    }, function goHome(err) {
      if (err) {
        throw err;
      } 
       res.send({
            code: 200, 
            data: ids,
            err: err
       });
    });
  }
};

module.exports = DataCenter;
