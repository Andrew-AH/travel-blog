<?php
/** Run only against the mounted journal theme, as the configured administrator. */
if ( ! function_exists( 'wei_theme_import_content' ) ) {
    WP_CLI::error( 'The travel journal theme is not active.' );
}
if ( get_option( 'wei_docker_setup_complete' ) && ! get_option( 'wei_pending_media' ) ) {
    WP_CLI::success( 'Journal already imported; your content and settings were kept.' );
    return;
}
$report = wei_theme_import_content( ! get_option( 'wei_content_installed' ) );
if ( is_wp_error( $report ) ) {
    WP_CLI::error( $report->get_error_message() );
}
foreach ( $report as $line ) {
    WP_CLI::log( $line );
}
if ( get_option( 'wei_pending_media' ) ) {
    WP_CLI::error( 'Some photos need another import attempt. Run the setup service again.' );
}
update_option( 'wei_docker_setup_complete', true );
WP_CLI::success( 'Travel journal content imported.' );
