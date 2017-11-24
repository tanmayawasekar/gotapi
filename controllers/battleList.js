const utils = require('../helpers/utils');

// Get the list of battle location
exports.getBattleLocation = (req, res) => {
  global
    .db.collection('battleLists')
    .aggregate([{
      "$group": {
        "_id": "$location",
        "region": {
          "$addToSet": "$region"
        }
      }
    }, {
      "$unwind": "$region"
    }, {
      "$project": {
        "location": "$_id",
        "region": 1,
        "_id": 0
      }
    }])
    .toArray()
    .then(battleDataList => res.send(battleDataList))
    .catch(error => {
      res.status(500).send('Internal Server Error');
    });
};

// Get total battles faught
exports.totalBattles = (req, res) => {
  global
    .db.collection('battleLists').find({})
    .sort({
      'battle_number': -1
    })
    .limit(1)
    .toArray()
    .then(totlaBattle => res.send({
      'totlaBattle': totlaBattle[0] && totlaBattle[0].battle_number || 0
    }))
    .catch(error => {
      res.status(500).send('Internal Server Error');
    });
};

exports.getBattleStats = (req, res) => {

  Promise.all([
      global.db.collection('battleLists').aggregate([{
        '$group': {
          '_id': '$attacker_king',
          'totalCount': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          'totalCount': -1
        }
      }, {
        '$limit': 1
      }]).toArray(),
      global.db.collection('battleLists').aggregate([{
        '$group': {
          '_id': '$defender_king',
          'totalCount': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          'totalCount': -1
        }
      }, {
        '$limit': 1
      }]).toArray(),
      global.db.collection('battleLists').aggregate([{
        '$group': {
          '_id': '$region',
          'totalCount': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          'totalCount': -1
        }
      }, {
        '$limit': 1
      }]).toArray(),
      global.db.collection('battleLists').aggregate([{
        '$group': {
          '_id': '$name',
          'totalCount': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          'totalCount': -1
        }
      }, {
        '$limit': 1
      }]).toArray(),
      global.db.collection('battleLists').aggregate([{
        "$group": {
          "_id": null,
          "battle_type": {
            "$addToSet": "$battle_type"
          },
          "average_defender_size": {
            "$avg": "$defender_size"
          },
          "min_defender_size": {
            "$min": "$defender_size"
          },
          "max_defender_size": {
            "$max": "$defender_size"
          },
          'totalAttackersLoss': {
            '$push': {
              '$cond': {
                'if': {
                  '$eq': ["$attacker_outcome", "loss"]
                },
                'then': "$attacker_outcome",
                'else': "",
              }
            }
          },
          'totalAttackersWin': {
            '$push': {
              '$cond': {
                'if': {
                  '$eq': ["$attacker_outcome", "win"]
                },
                'then': "$attacker_outcome",
                'else': "",
              }
            }
          }
        }
      }, {
        '$project': {
          'battle_type': {
            '$filter': {
              'input': '$battle_type',
              'as': "battle_type_string",
              'cond': {
                '$ne': ["$$battle_type_string", ""]
              }
            }
          },
          'defender_size.max': "$max_defender_size",
          'defender_size.min': "$min_defender_size",
          'defender_size.average': "$average_defender_size",
          'attacker_outcome.win': {
            '$size': {
              '$filter': {
                'input': '$totalAttackersWin',
                'as': "input_attacker_outcome",
                'cond': {
                  '$ne': ["$$input_attacker_outcome", ""]
                }
              }
            }
          },
          'attacker_outcome.loss': {
            '$size': {
              '$filter': {
                'input': '$totalAttackersLoss',
                'as': "input_attacker_outcome",
                'cond': {
                  '$ne': ["$$input_attacker_outcome", ""]
                }
              }
            }
          }
        }
      }]).toArray()
    ])
    .then(aggregatedData => {
      res.send({
        'most_active': {
          'attacker_king': aggregatedData[0][0]._id,
          'defender_king': aggregatedData[1][0]._id,
          'region': aggregatedData[2][0]._id,
          'name': aggregatedData[3][0]._id,
        },
        'attacker_outcome': aggregatedData[4][0].attacker_outcome,
        'battle_type': aggregatedData[4][0].battle_type,
        'defender_size': aggregatedData[4][0].defender_size
      });
    })
    .catch(error => {
      console.log("error ", error.stack);
      res.status(500).send('Internal Server Error');
    });
};

// Get total battles faught
exports.searchBattle = (req, res) => {
  const query = req.query || {};
  for (let key in query) {
    if (utils.validateNumberInString(query[key])) {
      query[key] = Number(query[key]);
    }

    if (key === 'king') {
      query['$or'] = query['$or'] || [];
      query['$or'].push({
        'defender_king': utils.createSearchQuery(query[key])
      }, {
        'attacker_king': utils.createSearchQuery(query[key])
      });
      delete query[key];
    }

    if(typeof query[key] === 'string') {
      query[key] = utils.createSearchQuery(query[key]);
    }
  }

  global
    .db.collection('battleLists').find(query)
    .toArray()
    .then(totlaBattle => res.send(totlaBattle))
    .catch(error => {
      res.status(500).send('Internal Server Error');
    });
};
