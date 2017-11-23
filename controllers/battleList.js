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

/*  db.getCollection('battles').aggregate([{
    "$group": {
      "_id": "1",
      "battle_type": {
        "$addToSet": "$battle_type"
      },
      "average": {
        "$avg": "$defender_size"
      },
      "min": {
        "$min": "$defender_size"
      },
      "max": {
        "$max": "$defender_size"
      },
      totalAttackersLoss: {
        $push: {
          $cond: {
            if: {
              $eq: ["$attacker_outcome", "loss"]
            },
            then: "$attacker_outcome",
            else: null,
          }
        }
      },
       totalAttackersWin: {
        $push: {
          $cond: {
            if: {
              $eq: ["$attacker_outcome", "win"]
            },
            then: "$attacker_outcome",
            else: null,
          }
        }
      }
    }
  }]) */