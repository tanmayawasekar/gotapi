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
