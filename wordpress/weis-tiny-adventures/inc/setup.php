<?php
/** Explicit, repeatable setup; never overwrites pages or content already present. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'admin_menu', function () {
    add_theme_page( 'Set up Wei’s journal', 'Set up Wei’s journal', 'manage_options', 'wei-setup', 'wei_theme_setup_screen' );
} );
add_action( 'admin_notices', function () {
    if ( ! current_user_can( 'manage_options' ) || get_option( 'wei_content_installed' ) ) { return; }
    echo '<div class="notice notice-info"><p>Welcome to Weis Tiny Adventures. <a href="' . esc_url( admin_url( 'themes.php?page=wei-setup' ) ) . '">Set up your editable travel journal</a> to import the existing pages, photos, and destinations.</p></div>';
} );

function wei_theme_setup_screen() {
    if ( ! current_user_can( 'manage_options' ) ) { return; }
    $report = null;
    if ( isset( $_POST['wei_install'] ) ) {
        check_admin_referer( 'wei_install_content' );
        $report = wei_theme_import_content( ! empty( $_POST['wei_homepage'] ) );
    }
    echo '<div class="wrap"><h1>Set up Wei’s travel journal</h1><p>Import the current design as editable pages, 16 destination records, photos, and three clearly labelled coming-soon article previews.</p>';
    if ( ! post_type_exists( 'wei_destination' ) ) {
        echo '<div class="notice notice-warning inline"><p>Install and activate the included <strong>Wei Travel Tools</strong> plugin first. It supplies the destination editor, interactive map, travel tools, and newsletter forms.</p></div></div>';
        return;
    }
    if ( is_wp_error( $report ) ) { echo '<div class="notice notice-error inline"><p>' . esc_html( $report->get_error_message() ) . '</p></div>'; }
    elseif ( is_array( $report ) ) {
        echo '<div class="notice notice-success inline"><p>Journal content is ready. Existing matching pages and imported items were left intact.</p></div><ul>';
        foreach ( $report as $line ) { echo '<li>' . esc_html( $line ) . '</li>'; }
        echo '</ul><p><a class="button button-primary" href="' . esc_url( home_url( '/' ) ) . '">View your journal</a> <a class="button" href="' . esc_url( admin_url( 'edit.php?post_type=page' ) ) . '">Edit pages</a></p>';
    }
    echo '<p>This adds content to this WordPress installation. It does not delete or replace existing pages, posts, subscribers, or media. You can run it again to add missing starter content.</p><form method="post">';
    wp_nonce_field( 'wei_install_content' );
    echo '<p><label><input type="checkbox" name="wei_homepage" value="1" checked> Use the imported Home page as this site’s homepage.</label></p>';
    submit_button( 'Import the travel journal', 'primary', 'wei_install' );
    echo '</form><h2>Where to edit</h2><ul><li><strong>Pages:</strong> Home, About Me, Travel Tips, Budget Guides, Destinations, and signup pages.</li><li><strong>Posts:</strong> Write articles, choose a country, and set a featured image. Turn off “Coming soon” when an article is ready.</li><li><strong>Destinations:</strong> Add places, photos, descriptions, country, continent, and map coordinates.</li><li><strong>Appearance → Editor:</strong> Change the header, menu, footer, templates, colours, and fonts.</li><li><strong>Tools → Newsletter:</strong> Export consenting subscribers. Email delivery is not connected.</li></ul></div>';
}

function wei_theme_import_media( $relative, $alt = '' ) {
    static $cache = array();
    $relative = ltrim( $relative, '/' );
    if ( isset( $cache[ $relative ] ) ) { return $cache[ $relative ]; }
    $existing = get_posts( array( 'post_type' => 'attachment', 'post_status' => 'inherit', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => '_wei_original_asset', 'meta_value' => $relative ) );
    if ( $existing ) { return $cache[ $relative ] = (int) $existing[0]; }
    $base = realpath( get_theme_file_path( 'assets' ) );
    $file = realpath( get_theme_file_path( 'assets/' . $relative ) );
    if ( ! $base || ! $file || strpos( wp_normalize_path( $file ), wp_normalize_path( $base ) . '/' ) !== 0 ) { return wei_theme_media_failed( $relative ); }
    $type = wp_check_filetype( $file );
    if ( empty( $type['type'] ) || strpos( $type['type'], 'image/' ) !== 0 || $type['ext'] === 'svg' ) { return 0; }
    $upload = wp_upload_bits( basename( $file ), null, file_get_contents( $file ) );
    if ( ! empty( $upload['error'] ) ) { return wei_theme_media_failed( $relative ); }
    $id = wp_insert_attachment( array( 'post_mime_type' => $type['type'], 'post_title' => ucwords( str_replace( array( '-', '_' ), ' ', pathinfo( $file, PATHINFO_FILENAME ) ) ), 'post_status' => 'inherit' ), $upload['file'], 0, true );
    if ( is_wp_error( $id ) ) { return wei_theme_media_failed( $relative ); }
    update_post_meta( $id, '_wei_original_asset', $relative );
    update_post_meta( $id, '_wp_attachment_image_alt', sanitize_text_field( $alt ) );
    require_once ABSPATH . 'wp-admin/includes/image.php';
    wp_update_attachment_metadata( $id, wp_generate_attachment_metadata( $id, $upload['file'] ) );
    return $cache[ $relative ] = (int) $id;
}

function wei_theme_media_failed( $relative ) {
    $GLOBALS['wei_theme_media_failures'][ $relative ] = true;
    return 0;
}

/** The only bypass is for the bundled, trusted block files, not submitted user HTML. */
function wei_theme_insert_bundled_page( $post ) {
    $priority = has_filter( 'content_save_pre', 'wp_filter_post_kses' );
    if ( false !== $priority ) { remove_filter( 'content_save_pre', 'wp_filter_post_kses', $priority ); }
    try { return wp_insert_post( $post, true ); }
    finally { if ( false !== $priority ) { add_filter( 'content_save_pre', 'wp_filter_post_kses', $priority ); } }
}

function wei_theme_resolve_content( $content ) {
    $content = preg_replace_callback( '/\{\{asset:([^}]+)\}\}/', function ( $match ) {
        $id = wei_theme_import_media( $match[1] );
        return esc_url( $id ? wp_get_attachment_url( $id ) : get_theme_file_uri( 'assets/' . ltrim( $match[1], '/' ) ) );
    }, $content );
    return preg_replace_callback( '/\{\{url:([^}]+)\}\}/', function ( $match ) {
        return esc_url( home_url( $match[1] ) );
    }, $content );
}

function wei_theme_seed_id( $type, $key ) {
    $ids = get_posts( array( 'post_type' => $type, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => '_wei_seed', 'meta_value' => $key ) );
    return $ids ? (int) $ids[0] : 0;
}

function wei_theme_import_content( $set_home = false ) {
    if ( ! current_user_can( 'manage_options' ) ) { return new WP_Error( 'forbidden', 'An administrator must import the journal.' ); }
    if ( ! post_type_exists( 'wei_destination' ) || ! taxonomy_exists( 'wei_country' ) ) { return new WP_Error( 'missing_plugin', 'Activate Wei Travel Tools first.' ); }
    if ( function_exists( 'set_time_limit' ) ) { @set_time_limit( 180 ); }
    $seed = json_decode( file_get_contents( get_theme_file_path( 'content/seed.json' ) ), true );
    if ( ! is_array( $seed ) ) { return new WP_Error( 'missing_seed', 'The content package is missing. Reinstall the complete theme ZIP.' ); }
    $report = array(); $countries = array(); $destinations_added = 0; $posts_added = 0; $pages_added = 0;
    $GLOBALS['wei_theme_media_failures'] = array();
    foreach ( get_option( 'wei_pending_media', array() ) as $relative ) { wei_theme_import_media( $relative ); }
    foreach ( $seed['destinations'] as $place ) {
        $country = $place['country'];
        if ( ! isset( $countries[ $country ] ) ) {
            $term = term_exists( $country, 'wei_country' );
            if ( ! $term ) { $term = wp_insert_term( $country, 'wei_country', array( 'slug' => sanitize_title( $country ) ) ); }
            if ( is_wp_error( $term ) ) { return $term; }
            $countries[ $country ] = (int) $term['term_id'];
        }
        $existing_id = wei_theme_seed_id( 'wei_destination', $place['id'] );
        if ( $existing_id ) {
            if ( ! get_post_thumbnail_id( $existing_id ) && get_post_meta( $existing_id, '_wei_pending_photo', true ) ) {
                $image = wei_theme_import_media( $place['image'], $place['imageAlt'] );
                if ( $image ) { set_post_thumbnail( $existing_id, $image ); delete_post_meta( $existing_id, '_wei_pending_photo' ); }
            }
            continue;
        }
        $id = wp_insert_post( array( 'post_type' => 'wei_destination', 'post_status' => 'publish', 'post_title' => $place['name'], 'post_name' => $place['id'], 'post_excerpt' => $place['tagline'], 'post_content' => '<!-- wp:paragraph --><p>' . esc_html( $place['description'] ) . '</p><!-- /wp:paragraph -->', 'menu_order' => $destinations_added ), true );
        if ( is_wp_error( $id ) ) { return $id; }
        update_post_meta( $id, '_wei_seed', $place['id'] );
        wp_set_object_terms( $id, array( $countries[ $country ] ), 'wei_country' );
        foreach ( array( 'region', 'details', 'highlight', 'atmosphere' ) as $field ) { if ( isset( $place[ $field ] ) ) { update_post_meta( $id, '_wei_' . $field, $place[ $field ] ); } }
        update_post_meta( $id, '_wei_longitude', $place['coordinates'][0] );
        update_post_meta( $id, '_wei_latitude', $place['coordinates'][1] );
        update_post_meta( $id, '_wei_image_alt', $place['imageAlt'] );
        $image = wei_theme_import_media( $place['image'], $place['imageAlt'] );
        if ( $image ) { set_post_thumbnail( $id, $image ); }
        else { update_post_meta( $id, '_wei_pending_photo', true ); }
        $destinations_added++;
    }
    $category = term_exists( 'Destinations', 'category' );
    if ( ! $category ) { $category = wp_insert_term( 'Destinations', 'category' ); }
    foreach ( $seed['posts'] as $post ) {
        $existing_id = wei_theme_seed_id( 'post', $post['id'] );
        if ( $existing_id ) {
            if ( ! get_post_thumbnail_id( $existing_id ) && get_post_meta( $existing_id, '_wei_pending_photo', true ) ) {
                $image = wei_theme_import_media( $post['image'], $post['alt'] );
                if ( $image ) { set_post_thumbnail( $existing_id, $image ); delete_post_meta( $existing_id, '_wei_pending_photo' ); }
            }
            continue;
        }
        $id = wp_insert_post( array( 'post_type' => 'post', 'post_status' => 'publish', 'post_title' => $post['title'], 'post_name' => $post['id'], 'post_excerpt' => $post['excerpt'], 'post_content' => '<!-- wp:paragraph --><p>' . esc_html( $post['excerpt'] ) . '</p><!-- /wp:paragraph -->' ), true );
        if ( is_wp_error( $id ) ) { return $id; }
        update_post_meta( $id, '_wei_seed', $post['id'] );
        update_post_meta( $id, '_wei_coming_soon', true );
        update_post_meta( $id, '_wei_image_class', sanitize_html_class( $post['imageClass'] ?? '' ) );
        if ( ! is_wp_error( $category ) ) { wp_set_post_categories( $id, array( (int) $category['term_id'] ) ); }
        wp_set_object_terms( $id, array( $countries[ $post['country'] ] ), 'wei_country' );
        $image = wei_theme_import_media( $post['image'], $post['alt'] );
        if ( $image ) { set_post_thumbnail( $id, $image ); }
        else { update_post_meta( $id, '_wei_pending_photo', true ); }
        $posts_added++;
    }
    $pages = array( 'home' => 'Home', 'about-me' => 'About Me', 'travel-tips' => 'Travel Tips', 'budget-guides' => 'Budget Guides', 'destinations' => 'Destinations', 'subscribe' => 'Letters from Wei', 'unsubscribe' => 'Unsubscribe' );
    foreach ( $pages as $slug => $title ) {
        $id = wei_theme_seed_id( 'page', $slug );
        if ( ! $id ) {
            $existing = get_page_by_path( $slug );
            if ( $existing ) {
                $report[] = 'Kept existing page: ' . $title . '. Starter layout is available in the theme content folder.';
                if ( $slug === 'home' && $set_home ) { $report[] = 'The homepage was not switched because an existing Home page was kept. Choose your homepage in Settings → Reading.'; }
                continue;
            }
            $file = get_theme_file_path( 'content/' . $slug . '.html' );
            if ( ! file_exists( $file ) ) { return new WP_Error( 'missing_page', 'Missing starter layout: ' . $slug ); }
            $content = wei_theme_resolve_content( file_get_contents( $file ) );
            $id = wei_theme_insert_bundled_page( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => $title, 'post_name' => $slug, 'post_content' => wp_slash( $content ) ) );
            if ( is_wp_error( $id ) ) { return $id; }
            update_post_meta( $id, '_wei_seed', $slug );
            update_post_meta( $id, '_wp_page_template', 'journal-page' );
            $pages_added++;
        }
        if ( $slug === 'home' && $set_home ) { update_option( 'show_on_front', 'page' ); update_option( 'page_on_front', $id ); }
    }
    if ( ! get_option( 'permalink_structure' ) ) { update_option( 'permalink_structure', '/%postname%/' ); }
    flush_rewrite_rules();
    update_option( 'wei_content_installed', '1.0.0' );
    $pending = array_keys( $GLOBALS['wei_theme_media_failures'] );
    update_option( 'wei_pending_media', $pending );
    foreach ( $pending as $relative ) { $report[] = 'Photo import needs retry: ' . $relative . '. Check that uploads are writable, then run this importer again.'; }
    $report[] = sprintf( 'Added %d pages, %d destinations, and %d article previews.', $pages_added, $destinations_added, $posts_added );
    return $report;
}
