module.exports = {
  validateNumberInString(string) {
    if (string && typeof string === 'string' && string.match(/^\d+$/)) {
      return true;
    }
    return false;
  },
  createSearchQuery(searchText) {
    return new RegExp('.*' + searchText.replace(/\"/g, "") + '.*', 'i');
  }
};
