<?php
/**
 * Title: Wei's site header
 * Slug: wei/header
 * Categories: wei-journal
 * Inserter: no
 */
?>
<!-- wp:group {"tagName":"header","className":"site-header wei-header"} -->
<header class="wp-block-group site-header wei-header">
<!-- wp:group {"className":"brand"} --><div class="wp-block-group brand">
<!-- wp:image {"sizeSlug":"full","linkDestination":"custom","className":"brand-emblem"} -->
<figure class="wp-block-image size-full brand-emblem"><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/brand-mark.svg' ) ); ?>" alt="Weis Tiny Adventures home"/></a></figure><!-- /wp:image -->
<!-- wp:group {"className":"brand-wordmark"} --><div class="wp-block-group brand-wordmark">
<!-- wp:paragraph {"className":"brand-title"} --><p class="brand-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Weis Tiny</a></p><!-- /wp:paragraph -->
<!-- wp:paragraph {"className":"brand-tagline"} --><p class="brand-tagline">Adventures</p><!-- /wp:paragraph -->
</div><!-- /wp:group --></div><!-- /wp:group -->
<!-- wp:navigation {"overlayMenu":"mobile","className":"wei-navigation","layout":{"type":"flex","justifyContent":"right"}} -->
<!-- wp:navigation-link <?php echo wp_json_encode( array( 'label' => 'Destinations', 'url' => home_url( '/destinations/' ), 'kind' => 'custom' ) ); ?> /-->
<!-- wp:navigation-link <?php echo wp_json_encode( array( 'label' => 'Budget guides', 'url' => home_url( '/budget-guides/' ), 'kind' => 'custom' ) ); ?> /-->
<!-- wp:navigation-link <?php echo wp_json_encode( array( 'label' => 'Travel tips', 'url' => home_url( '/travel-tips/' ), 'kind' => 'custom' ) ); ?> /-->
<!-- wp:navigation-link <?php echo wp_json_encode( array( 'label' => 'About me', 'url' => home_url( '/about-me/' ), 'kind' => 'custom' ) ); ?> /-->
<!-- /wp:navigation -->
<!-- wp:buttons {"className":"wei-header-subscribe"} --><div class="wp-block-buttons wei-header-subscribe"><!-- wp:button {"className":"subscribe-button"} --><div class="wp-block-button subscribe-button"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( home_url( '/subscribe/' ) ); ?>">Subscribe</a></div><!-- /wp:button --></div><!-- /wp:buttons -->
</header><!-- /wp:group -->
