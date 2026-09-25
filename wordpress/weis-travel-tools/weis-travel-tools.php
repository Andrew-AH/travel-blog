<?php
/**
 * Plugin Name: Wei's Travel Tools
 * Description: Editable destinations, country journals, a destination atlas and travel tools for Wei's Tiny Adventures.
 * Version: 1.0.0
 * Requires at least: 6.6
 * Requires PHP: 8.0
 * Author: Wei's Tiny Adventures
 * License: GPL-2.0-or-later
 * Text Domain: weis-travel-tools
 */
defined( 'ABSPATH' ) || exit;
define( 'WEI_TOOLS_VERSION', '1.0.0' );
define( 'WEI_TOOLS_DIR', plugin_dir_path( __FILE__ ) );
define( 'WEI_TOOLS_URL', plugin_dir_url( __FILE__ ) );

function wei_tools_register_content() {
    register_post_type( 'wei_destination', array(
        'labels' => array( 'name' => 'Destinations', 'singular_name' => 'Destination', 'add_new_item' => 'Add destination', 'edit_item' => 'Edit destination' ),
        'public' => true, 'show_in_rest' => true, 'menu_icon' => 'dashicons-location-alt',
        'supports' => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields', 'page-attributes' ),
        'has_archive' => false, 'rewrite' => array( 'slug' => 'place', 'with_front' => false ),
    ) );
    register_taxonomy( 'wei_country', array( 'post', 'wei_destination' ), array(
        'labels' => array( 'name' => 'Countries', 'singular_name' => 'Country', 'add_new_item' => 'Add country' ),
        'public' => true, 'show_in_rest' => true, 'show_admin_column' => true, 'hierarchical' => true,
        'rewrite' => array( 'slug' => 'destinations', 'with_front' => false ),
    ) );
    foreach ( array( '_wei_region', '_wei_image_alt' ) as $key ) {
        register_post_meta( 'wei_destination', $key, array( 'type' => 'string', 'single' => true, 'show_in_rest' => true, 'sanitize_callback' => 'sanitize_text_field', 'auth_callback' => 'wei_tools_can_edit_meta' ) );
    }
    foreach ( array( '_wei_longitude', '_wei_latitude' ) as $key ) {
        register_post_meta( 'wei_destination', $key, array( 'type' => 'number', 'single' => true, 'show_in_rest' => true, 'sanitize_callback' => 'wei_tools_coordinate', 'auth_callback' => 'wei_tools_can_edit_meta' ) );
    }
    register_post_meta( 'post', '_wei_coming_soon', array( 'type' => 'boolean', 'single' => true, 'show_in_rest' => true, 'sanitize_callback' => 'rest_sanitize_boolean', 'auth_callback' => 'wei_tools_can_edit_meta' ) );
    register_post_meta( 'post', '_wei_read_time', array( 'type' => 'string', 'single' => true, 'show_in_rest' => true, 'sanitize_callback' => 'sanitize_text_field', 'auth_callback' => 'wei_tools_can_edit_meta' ) );
    register_post_meta( 'post', '_wei_image_class', array( 'type' => 'string', 'single' => true, 'show_in_rest' => true, 'sanitize_callback' => 'sanitize_html_class', 'auth_callback' => 'wei_tools_can_edit_meta' ) );
    add_post_type_support( 'post', 'custom-fields' );
}
function wei_tools_can_edit_meta( $allowed, $key, $post_id ) { return current_user_can( 'edit_post', $post_id ); }
function wei_tools_coordinate( $value, $key ) { $limit = '_wei_latitude' === $key ? 90 : 180; return max( -$limit, min( $limit, (float) $value ) ); }
add_action( 'init', 'wei_tools_register_content' );
register_activation_hook( __FILE__, function() { wei_tools_register_content(); flush_rewrite_rules(); } );
register_deactivation_hook( __FILE__, function() { flush_rewrite_rules(); } );
add_action( 'pre_get_posts', function( $query ) {
    if ( ! is_admin() && $query->is_main_query() && $query->is_tax( 'wei_country' ) ) { $query->set( 'post_type', 'post' ); }
} );

add_action( 'add_meta_boxes', function() {
    add_meta_box( 'wei-destination-details', 'Destination map details', 'wei_tools_destination_fields', 'wei_destination', 'normal', 'high' );
    add_meta_box( 'wei-story-details', 'Travel journal settings', 'wei_tools_story_fields', 'post', 'side' );
} );
function wei_tools_destination_fields( $post ) {
    wp_nonce_field( 'wei_destination_details', 'wei_destination_nonce' );
    echo '<p>The title is the place name, the main content is its postcard description, and the excerpt is its short tagline. Choose a Country in the editor sidebar. Use Featured image to choose or upload its photograph.</p>';
    $region = get_post_meta( $post->ID, '_wei_region', true );
    echo '<p><label for="wei-region"><strong>Continent</strong></label><br><select name="wei_region" id="wei-region"><option value="">Choose a continent</option>';
    foreach ( array( 'Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America' ) as $item ) {
        echo '<option value="' . esc_attr( $item ) . '" ' . selected( $region, $item, false ) . '>' . esc_html( $item ) . '</option>';
    }
    echo '</select></p>';
    foreach ( array( 'longitude' => 180, 'latitude' => 90 ) as $field => $limit ) {
        echo '<p><label for="wei-' . esc_attr( $field ) . '"><strong>' . esc_html( ucfirst( $field ) ) . '</strong></label><br><input id="wei-' . esc_attr( $field ) . '" name="wei_' . esc_attr( $field ) . '" type="number" step="any" min="-' . esc_attr( $limit ) . '" max="' . esc_attr( $limit ) . '" value="' . esc_attr( get_post_meta( $post->ID, '_wei_' . $field, true ) ) . '"></p>';
    }
    echo '<p>For example, Bali is longitude 115.1889, latitude -8.4095. Leave either coordinate empty to show the destination in the list without a map pin.</p>';
    echo '<p><label for="wei-image-alt"><strong>Image description</strong> (optional override)</label><br><input class="widefat" id="wei-image-alt" name="wei_image_alt" value="' . esc_attr( get_post_meta( $post->ID, '_wei_image_alt', true ) ) . '"></p>';
}
function wei_tools_story_fields( $post ) {
    wp_nonce_field( 'wei_story_details', 'wei_story_nonce' );
    echo '<p><label><input type="checkbox" name="wei_coming_soon" value="1" ' . checked( (bool) get_post_meta( $post->ID, '_wei_coming_soon', true ), true, false ) . '> Show as a coming soon preview</label></p><p>Published previews appear in the journal grids with a Coming soon label. Uncheck when your story is ready.</p>';
    echo '<p><label for="wei-read-time">Reading time (optional)</label><input id="wei-read-time" class="widefat" name="wei_read_time" placeholder="5 min read" value="' . esc_attr( get_post_meta( $post->ID, '_wei_read_time', true ) ) . '"></p>';
    $crop = get_post_meta( $post->ID, '_wei_image_class', true );
    echo '<p><label for="wei-image-class">Photograph crop</label><select class="widefat" id="wei-image-class" name="wei_image_class">';
    foreach ( array( '' => 'Centre (default)', 'bali-photo' => 'Slightly below centre', 'lovina-photo' => 'Lower part of photograph' ) as $value => $label ) {
        echo '<option value="' . esc_attr( $value ) . '" ' . selected( $crop, $value, false ) . '>' . esc_html( $label ) . '</option>';
    }
    echo '</select></p>';
}
add_action( 'save_post', function( $post_id ) {
    if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) { return; }
    if ( 'wei_destination' === get_post_type( $post_id ) && isset( $_POST['wei_destination_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['wei_destination_nonce'] ) ), 'wei_destination_details' ) ) {
        foreach ( array( 'region', 'image_alt' ) as $field ) {
            update_post_meta( $post_id, '_wei_' . $field, sanitize_text_field( wp_unslash( $_POST[ 'wei_' . $field ] ?? '' ) ) );
        }
        foreach ( array( 'longitude', 'latitude' ) as $field ) {
            $value = sanitize_text_field( wp_unslash( $_POST[ 'wei_' . $field ] ?? '' ) );
            if ( '' === $value || ! is_numeric( $value ) ) { delete_post_meta( $post_id, '_wei_' . $field ); }
            else { update_post_meta( $post_id, '_wei_' . $field, wei_tools_coordinate( $value, '_wei_' . $field ) ); }
        }
    }
    if ( 'post' === get_post_type( $post_id ) && isset( $_POST['wei_story_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['wei_story_nonce'] ) ), 'wei_story_details' ) ) {
        update_post_meta( $post_id, '_wei_coming_soon', isset( $_POST['wei_coming_soon'] ) );
        update_post_meta( $post_id, '_wei_read_time', sanitize_text_field( wp_unslash( $_POST['wei_read_time'] ?? '' ) ) );
        update_post_meta( $post_id, '_wei_image_class', sanitize_html_class( wp_unslash( $_POST['wei_image_class'] ?? '' ) ) );
    }
} );

/** Public records use WordPress attachment URLs and taxonomy permalinks, including subdirectory installs. */
function wei_tools_destinations() {
    $records = array();
    $posts = get_posts( array( 'post_type' => 'wei_destination', 'post_status' => 'publish', 'has_password' => false, 'numberposts' => -1, 'orderby' => array( 'menu_order' => 'ASC', 'title' => 'ASC' ) ) );
    foreach ( $posts as $post ) {
        $terms = get_the_terms( $post->ID, 'wei_country' );
        $country = ! is_wp_error( $terms ) && $terms ? reset( $terms ) : null;
        $url = $country ? get_term_link( $country ) : get_permalink( $post );
        $image_id = get_post_thumbnail_id( $post );
        $longitude = get_post_meta( $post->ID, '_wei_longitude', true );
        $latitude = get_post_meta( $post->ID, '_wei_latitude', true );
        $records[] = array(
            'id' => (string) $post->ID, 'name' => get_the_title( $post ), 'country' => $country ? $country->name : '',
            'region' => get_post_meta( $post->ID, '_wei_region', true ), 'href' => is_wp_error( $url ) ? get_permalink( $post ) : $url,
            'coordinates' => is_numeric( $longitude ) && is_numeric( $latitude ) ? array( (float) $longitude, (float) $latitude ) : null,
            'description' => wp_strip_all_tags( strip_shortcodes( $post->post_content ) ), 'tagline' => get_the_excerpt( $post ),
            'image' => wp_get_attachment_image_url( $image_id, 'large' ) ?: '', 'imageSmall' => wp_get_attachment_image_url( $image_id, 'medium' ) ?: '',
            'imageAlt' => get_post_meta( $post->ID, '_wei_image_alt', true ) ?: get_post_meta( $image_id, '_wp_attachment_image_alt', true ),
        );
    }
    return $records;
}

function wei_tools_register_blocks() {
    wp_register_script( 'wei-tools-frontend', WEI_TOOLS_URL . 'assets/travel-tools.js', array(), WEI_TOOLS_VERSION, true );
    wp_register_style( 'wei-tools', WEI_TOOLS_URL . 'assets/travel-tools.css', array(), WEI_TOOLS_VERSION );
    wp_register_script( 'wei-tools-editor', WEI_TOOLS_URL . 'assets/editor.js', array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-server-side-render' ), WEI_TOOLS_VERSION, true );
    wp_register_style( 'wei-tools-editor', WEI_TOOLS_URL . 'assets/editor.css', array(), WEI_TOOLS_VERSION );
    $common = array( 'api_version' => 3, 'editor_script' => 'wei-tools-editor', 'editor_style' => 'wei-tools-editor', 'style' => 'wei-tools', 'supports' => array( 'html' => false, 'align' => array( 'wide', 'full' ) ) );
    foreach ( array( 'destination-atlas', 'packing-checklist', 'travel-safety', 'travel-entry' ) as $name ) {
        register_block_type( 'wei/' . $name, array_merge( $common, array(
            'view_script' => 'wei-tools-frontend',
            'attributes' => array( 'title' => array( 'type' => 'string', 'default' => '' ), 'description' => array( 'type' => 'string', 'default' => '' ) ),
            'render_callback' => function( $attributes, $content, $block ) use ( $name ) { return wei_tools_render_widget( $name, $attributes ); },
        ) ) );
    }
    foreach ( array( 'country-posts', 'recent-posts' ) as $name ) {
        register_block_type( 'wei/' . $name, array_merge( $common, array(
            'attributes' => array( 'count' => array( 'type' => 'number', 'default' => 'recent-posts' === $name ? 3 : 12 ), 'country' => array( 'type' => 'string', 'default' => '' ) ),
            'render_callback' => function( $attributes, $content, $block ) use ( $name ) { return wei_tools_render_posts( $attributes, $name ); },
        ) ) );
    }
    register_block_type( 'wei/country-cover', array_merge( $common, array( 'render_callback' => 'wei_tools_country_cover' ) ) );
}
add_action( 'init', 'wei_tools_register_blocks' );

function wei_tools_render_widget( $name, $attributes ) {
    $data = array( 'title' => sanitize_text_field( $attributes['title'] ?? '' ), 'description' => sanitize_textarea_field( $attributes['description'] ?? '' ) );
    if ( 'destination-atlas' === $name ) { $data['destinations'] = wei_tools_destinations(); }
    ob_start();
    echo '<div ' . get_block_wrapper_attributes( array( 'class' => 'wei-travel-widget', 'data-wei-widget' => $name ) ) . '>';
    echo '<div class="wei-widget-content">';
    if ( 'destination-atlas' === $name ) {
        echo '<div class="atlas-page wei-atlas-fallback"><div class="atlas-destination-grid">';
        foreach ( $data['destinations'] as $place ) {
            echo '<article class="atlas-destination-card"><a class="destination-photo-button" href="' . esc_url( $place['href'] ) . '">';
            if ( $place['image'] ) { echo '<img loading="lazy" src="' . esc_url( $place['image'] ) . '" alt="' . esc_attr( $place['imageAlt'] ) . '" width="800" height="600">'; }
            echo '</a><div class="destination-card-copy"><p class="atlas-kicker">' . esc_html( $place['country'] ) . '</p><h3><a href="' . esc_url( $place['href'] ) . '">' . esc_html( $place['name'] ) . '</a></h3><p>' . esc_html( $place['tagline'] ) . '</p></div></article>';
        }
        if ( ! $data['destinations'] ) { echo '<p>Your destination collection is ready for its first adventure. Add a published destination in the dashboard.</p>'; }
        echo '</div></div>';
    } elseif ( 'packing-checklist' === $name ) {
        echo '<section class="wei-widget-fallback"><h2>' . esc_html( $data['title'] ?: 'Pack a little lighter.' ) . '</h2><p>' . esc_html( $data['description'] ?: 'Start with travel documents, essential clothes, toiletries, your phone and wallet, chargers, a plug adapter and a reusable bottle.' ) . '</p><p>Enable JavaScript to tick and download your packing list.</p></section>';
    } elseif ( 'travel-safety' === $name ) {
        echo '<section class="wei-widget-fallback"><h2>' . esc_html( $data['title'] ?: 'Country safety check' ) . '</h2><p>' . esc_html( $data['description'] ?: 'Check the latest official travel advice before booking and before you leave.' ) . '</p><a href="https://www.smartraveller.gov.au/destinations" target="_blank" rel="noopener noreferrer">Browse Smartraveller country advice</a></section>';
    } else {
        echo '<section class="wei-widget-fallback"><h2>' . esc_html( $data['title'] ?: 'Visas & entry fees' ) . '</h2><p>' . esc_html( $data['description'] ?: 'Check entry requirements for your passport, route and travel dates on official government websites.' ) . '</p><a href="https://www.iata.org/en/travel-centre/" target="_blank" rel="noopener noreferrer">Open IATA Travel Centre</a></section>';
    }
    echo '</div><script type="application/json" class="wei-widget-data">' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . '</script></div>';
    return ob_get_clean();
}

function wei_tools_render_posts( $attributes, $name ) {
    $recent = 'recent-posts' === $name;
    $country = sanitize_title( $attributes['country'] ?? '' );
    if ( ! $country && 'country-posts' === $name && is_tax( 'wei_country' ) ) { $country = get_queried_object()->slug; }
    // A dedicated query argument keeps block pagination independent of the theme's main query size.
    $paged = 'country-posts' === $name ? max( 1, absint( $_GET['wei_page'] ?? 1 ) ) : 1;
    $args = array( 'post_type' => 'post', 'post_status' => 'publish', 'has_password' => false, 'posts_per_page' => max( 1, min( 48, (int) ( $attributes['count'] ?? 3 ) ) ), 'ignore_sticky_posts' => true, 'orderby' => array( 'date' => 'DESC', 'ID' => 'ASC' ), 'paged' => $paged );
    if ( $country ) { $args['tax_query'] = array( array( 'taxonomy' => 'wei_country', 'field' => 'slug', 'terms' => $country ) ); }
    $query = new WP_Query( $args );
    ob_start();
    echo '<div ' . get_block_wrapper_attributes( array( 'class' => 'wei-post-collection' ) ) . '><div class="' . ( $recent ? 'adventure-grid' : 'country-post-grid' ) . '">';
    foreach ( $query->posts as $post ) {
        $coming_soon = (bool) get_post_meta( $post->ID, '_wei_coming_soon', true );
        $categories = get_the_category( $post->ID );
        $terms = get_the_terms( $post->ID, 'wei_country' );
        $label = $categories ? $categories[0]->name : ( ! is_wp_error( $terms ) && $terms ? $terms[0]->name : 'From the journal' );
        $image_class = get_post_meta( $post->ID, '_wei_image_class', true );
        echo '<article class="' . ( $recent ? 'adventure-card' : 'country-post-card' ) . '" id="' . esc_attr( $post->post_name ) . '">' . get_the_post_thumbnail( $post->ID, 'large', array( 'loading' => 'lazy', 'class' => $image_class ) );
        echo '<div class="' . ( $recent ? 'card-content' : 'country-post-copy' ) . '"><p class="' . ( $recent ? 'card-category' : 'atlas-kicker' ) . '">' . esc_html( $label ) . '</p><h3>';
        if ( ! $coming_soon ) { echo '<a href="' . esc_url( get_permalink( $post ) ) . '">'; }
        echo esc_html( get_the_title( $post ) );
        if ( ! $coming_soon ) { echo '</a>'; }
        echo '</h3>';
        if ( ! $recent ) { echo '<p class="country-post-excerpt">' . esc_html( get_the_excerpt( $post ) ) . '</p>'; }
        $read_time = get_post_meta( $post->ID, '_wei_read_time', true );
        if ( $read_time ) { echo '<p class="wei-read-time">' . esc_html( $read_time ) . '</p>'; }
        $preview_url = $recent && $coming_soon && ! is_wp_error( $terms ) && $terms ? get_term_link( $terms[0] ) : '';
        if ( $preview_url && ! is_wp_error( $preview_url ) ) {
            echo '<a class="read-more" href="' . esc_url( $preview_url . '#' . $post->post_name ) . '" aria-label="' . esc_attr( 'Read more: ' . get_the_title( $post ) ) . '">Read more <span aria-hidden="true">→</span></a>';
        } else {
            echo $coming_soon ? '<p class="country-post-status">Coming soon</p>' : '<a class="' . ( $recent ? 'read-more' : 'postcard-link' ) . '" href="' . esc_url( get_permalink( $post ) ) . '">Read the story <span aria-hidden="true">→</span></a>';
        }
        echo '</div></article>';
    }
    echo '</div>';
    if ( ! $query->posts ) { echo '<div class="country-journal-empty"><h2>Stories are on their way.</h2><p>This journal is still taking shape. New blog posts will appear here when they are ready.</p></div>'; }
    if ( 'country-posts' === $name && $query->max_num_pages > 1 ) {
        $base_url = is_tax( 'wei_country' ) ? get_term_link( get_queried_object() ) : get_permalink();
        if ( ! is_wp_error( $base_url ) ) {
            $base = str_replace( '999999999', '%#%', add_query_arg( 'wei_page', 999999999, $base_url ) );
            echo '<nav class="wei-journal-pagination" aria-label="Journal pages">' . wp_kses_post( paginate_links( array( 'base' => $base, 'format' => '', 'total' => $query->max_num_pages, 'current' => $paged ) ) ) . '</nav>';
        }
    }
    echo '</div>';
    return ob_get_clean();
}

function wei_tools_country_cover() {
    if ( ! is_tax( 'wei_country' ) ) { return '<p class="wei-country-cover-placeholder">The country’s destination photograph appears here.</p>'; }
    $term = get_queried_object();
    $destinations = get_posts( array( 'post_type' => 'wei_destination', 'post_status' => 'publish', 'has_password' => false, 'numberposts' => 1, 'orderby' => 'menu_order', 'order' => 'ASC', 'tax_query' => array( array( 'taxonomy' => 'wei_country', 'field' => 'term_id', 'terms' => $term->term_id ) ), 'meta_query' => array( array( 'key' => '_thumbnail_id', 'compare' => 'EXISTS' ) ) ) );
    if ( ! $destinations ) { return ''; }
    $post = $destinations[0];
    return '<figure ' . get_block_wrapper_attributes( array( 'class' => 'country-journal-cover' ) ) . '>' . get_the_post_thumbnail( $post, 'large' ) . '<figcaption>A little of ' . esc_html( get_the_title( $post ) ) . '</figcaption></figure>';
}

if ( file_exists( WEI_TOOLS_DIR . 'includes/newsletter.php' ) ) { require_once WEI_TOOLS_DIR . 'includes/newsletter.php'; }
if ( file_exists( WEI_TOOLS_DIR . 'includes/starter-content.php' ) ) { require_once WEI_TOOLS_DIR . 'includes/starter-content.php'; }
