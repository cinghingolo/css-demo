/**
 * Check all pages
 */
require('./pages/check')

/**
 * Server modules
 */

require('./server/models/user')
require('./server/auth.test')
require('./server/constants.test')
require('./server/filters.test')


/**
 * Client modules
 */
require('./client/modules/table/table-functions.test')
