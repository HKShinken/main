const composer = require('openwhisk-composer')

module.exports = composer.if(
  composer.action('EVAL_LOGIN'),
  composer.action('success', { action: function (result) { return { page: "USER_GRID?username=" + result.username } } }),
  composer.action('failure', { action: function () { return { page: 'FORM_LOGIN?err=1' } } })
)
  
