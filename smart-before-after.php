<?php
/**
 * Plugin Name:       Smart Before After
 * Plugin URI:        https://github.com/cartfixwp/smart-before-after
 * Description:       A smart before/after image slider with behavior tracking and conversion triggers.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            CartFix
 * Author URI:        https://github.com/cartfixwp
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       smart-before-after
 *
 * @package SmartBeforeAfter
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Plugin constants.
define( 'SBA_VERSION', '1.0.0' );
define( 'SBA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SBA_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'SBA_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Main plugin class.
 */
final class Smart_Before_After {

	/**
	 * Single instance of the class.
	 *
	 * @var Smart_Before_After|null
	 */
	private static $instance = null;

	/**
	 * Get single instance of the class.
	 *
	 * @return Smart_Before_After
	 */
	public static function get_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize hooks.
	 */
	private function init_hooks() {
		add_action( 'init', array( $this, 'register_block' ) );
	}

	/**
	 * Register the block.
	 */
	public function register_block() {
		$block_path = SBA_PLUGIN_DIR . 'build/blocks/before-after';

		if ( file_exists( $block_path . '/block.json' ) ) {
			register_block_type( $block_path );
		}
	}
}

/**
 * Initialize the plugin.
 *
 * @return Smart_Before_After
 */
function smart_before_after() {
	return Smart_Before_After::get_instance();
}

// Start the plugin.
smart_before_after();