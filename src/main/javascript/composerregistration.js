const composer = require('openwhisk-composer')

module.exports = composer.seq(
  composer.action('EVAL_REG'),
  composer.action('NEW_USER')
)
  
