<?php
/** Theme support and the local content installer. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'after_setup_theme', function () {
    add_theme_support( 'wp-block-styles' );
    add_theme_support( 'editor-styles' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'responsive-embeds' );
    add_editor_style( array( 'assets/site.css', 'assets/wordpress.css', 'assets/editor.css' ) );
} );

add_action( 'wp_enqueue_scripts', function () {
    $uri = get_theme_file_uri();
    wp_enqueue_style( 'wei-original', $uri . '/assets/site.css', array(), '1.0.0' );
    wp_enqueue_style( 'wei-wordpress', $uri . '/assets/wordpress.css', array( 'wei-original' ), (string) filemtime( get_theme_file_path( 'assets/wordpress.css' ) ) );
    wp_enqueue_script( 'wei-theme', $uri . '/assets/theme.js', array(), '1.0.0', true );
} );

add_filter( 'body_class', function ( $classes ) {
    if ( is_front_page() ) { $classes[] = 'wei-home'; }
    $map = array( 'about-me' => 'about-page', 'travel-tips' => 'tips-page', 'budget-guides' => 'budget-page', 'destinations' => 'atlas-page', 'subscribe' => 'subscribe-page', 'unsubscribe' => 'subscribe-page' );
    foreach ( $map as $slug => $class ) { if ( is_page( $slug ) ) { $classes[] = $class; } }
    if ( is_tax( 'wei_country' ) ) { $classes[] = 'atlas-page'; $classes[] = 'country-journal-page'; }
    return $classes;
} );

add_action( 'init', function () {
    register_block_pattern_category( 'wei-journal', array( 'label' => __( 'Wei’s travel journal', 'weis-tiny-adventures' ) ) );
} );

require_once __DIR__ . '/inc/setup.php';

// Keep the original decorative lettering while its wording stays editable.
add_filter( 'render_block_core/paragraph', function ( $content, $block ) {
    if ( ! in_array( 'wei-crest-caption', explode( ' ', $block['attrs']['className'] ?? '' ), true ) ) { return $content; }
    $id = wp_unique_id( 'wei-crest-arc-' );
    $text = esc_html( strtoupper( trim( wp_strip_all_tags( $content ) ) ) );
    return '<svg class="crest-lettering" viewBox="0 0 360 110" role="img" aria-label="' . esc_attr( wp_strip_all_tags( $content ) ) . '"><defs><path id="' . esc_attr( $id ) . '" d="M 22 82 Q 180 -30 338 82"/></defs><text><textPath href="#' . esc_attr( $id ) . '" startOffset="50%" text-anchor="middle">' . $text . '</textPath></text></svg>';
}, 10, 2 );

// Decorate standard editable buttons without storing SVG in their editable text.
add_filter( 'render_block_core/button', function ( $content, $block ) {
    $classes = explode( ' ', $block['attrs']['className'] ?? '' );
    $icon = in_array( 'explore-button', $classes, true ) ? 'compass' : ( in_array( 'subscribe-button', $classes, true ) ? 'paper-plane' : '' );
    if ( ! $icon ) { return $content; }
    $file = get_theme_file_path( 'assets/icons/' . $icon . '.svg' );
    if ( ! is_readable( $file ) ) { return $content; }
    return preg_replace_callback( '/<a\b[^>]*>/', function ( $match ) use ( $file ) { return $match[0] . file_get_contents( $file ); }, $content, 1 );
}, 10, 2 );
