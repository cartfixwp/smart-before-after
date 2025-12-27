<?php
/**
 * Uninstall Smart Before/After
 *
 * Fired when the plugin is uninstalled.
 *
 * @package CartFix
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Currently, Smart Before/After does not store any data in the database.
 * All settings are stored as block attributes within the post content.
 *
 * If future versions add options or custom tables, cleanup code should be added here.
 *
 * Example cleanup code for future reference:
 *
 * // Delete options
 * delete_option( 'sba_settings' );
 *
 * // Delete user meta
 * delete_metadata( 'user', 0, 'sba_user_preferences', '', true );
 *
 * // Delete transients
 * delete_transient( 'sba_cache' );
 *
 * // Drop custom tables
 * global $wpdb;
 * $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}sba_analytics" );
 */
