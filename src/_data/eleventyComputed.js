module.exports = {
  permalink: function(data) {
    if (data.permalink) {
      return data.permalink;
    }
    if (data.page.filePathStem === '/index') {
      return '/index.html';
    }
    return data.page.filePathStem + '.html';
  }
};
