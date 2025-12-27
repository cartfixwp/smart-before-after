/**
 * Webpack Configuration
 *
 * Uses default @wordpress/scripts config.
 * The view.js file is automatically handled.
 *
 * @package CartFix
 */

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
    ...defaultConfig,
};
