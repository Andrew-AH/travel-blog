<?php
/**
 * Title: Alpine adventure hero
 * Slug: weis-tiny-adventures/alpine-hero
 * Categories: featured, banner
 * Description: Editable text, images and links from the travel journal.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!-- wp:group {"tagName":"section","className":"hero"} -->
<section class="wp-block-group hero">
<!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"hero-art"} -->
<figure class="wp-block-image size-full hero-art"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/alpine-hero-v1.webp' ) ); ?>" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:group {"className":"hero-content"} -->
<div class="wp-block-group hero-content">
<!-- wp:group {"className":"travel-crest"} -->
<div class="wp-block-group travel-crest">
<!-- wp:paragraph {"className":"wei-crest-caption"} -->
<p class="wei-crest-caption">Affordable travel · Real experiences</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<div class="crest-plane" aria-hidden="true"><svg class="wave-flourish" viewBox="0 0 110 15" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M2 8c9 0 9 4 17 4s9-7 18-7 9 6 18 6 9-6 18-6 9 6 18 6 9-3 17-3"/><path d="M8 10c8 0 10 3 16 2M42 7c6 0 7 5 14 5M79 7c6 0 9 5 15 5"/></svg><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M180.67,113.1l31.05-29.23.09-.08a28,28,0,0,0-39.6-39.6l-.08.09L142.9,75.33,57.37,44.23a4,4,0,0,0-4.2.93l-24,24a4,4,0,0,0,.61,6.16l68,45.29L78.35,140H56a4,4,0,0,0-2.83,1.18l-24,24a4,4,0,0,0,1.34,6.54l38.42,15.36,15.34,38.37,0,.09a4,4,0,0,0,6.59,1.23l23.93-23.93A4,4,0,0,0,116,200V177.65l19.38-19.38,45.29,67.95a4,4,0,0,0,6.16.61l24-24a4,4,0,0,0,.93-4.2Zm4,104.62-45.29-67.94A4,4,0,0,0,136.4,148l-.39,0a4,4,0,0,0-2.83,1.18l-24,24A4,4,0,0,0,108,176v22.34L89.47,216.88,75.72,182.51a4,4,0,0,0-2.23-2.23L39.12,166.53,57.66,148H80a4,4,0,0,0,2.83-1.17l24-24a4,4,0,0,0-.61-6.16L38.28,71.37,57,52.62l85.61,31.13a4,4,0,0,0,4.28-1l31-32.93A20,20,0,0,1,206.2,78.09l-32.93,31a4,4,0,0,0-1,4.28L203.38,199Z"></path></svg></div>
<!-- /wp:html -->
</div>
<!-- /wp:group -->

<!-- wp:heading {"level":1,"anchor":"hero-title"} -->
<h1 class="wp-block-heading" id="hero-title"><span class="hero-serif">Explore more</span><span class="hero-script">Spend Less</span></h1>
<!-- /wp:heading -->

<!-- wp:html -->
<div class="heart-divider" aria-hidden="true"><span></span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M178,44c-21.44,0-39.92,10.19-50,27.07C117.92,54.19,99.44,44,78,44a58.07,58.07,0,0,0-58,58c0,28.59,18,58.47,53.4,88.79a333.81,333.81,0,0,0,52.7,36.73,4,4,0,0,0,3.8,0,333.81,333.81,0,0,0,52.7-36.73C218,160.47,236,130.59,236,102A58.07,58.07,0,0,0,178,44ZM128,219.42c-14-8-100-59.35-100-117.42A50.06,50.06,0,0,1,78,52c21.11,0,38.85,11.31,46.3,29.51a4,4,0,0,0,7.4,0C139.15,63.31,156.89,52,178,52a50.06,50.06,0,0,1,50,50C228,160,142,211.46,128,219.42Z"></path></svg><span></span></div>
<!-- /wp:html -->

<!-- wp:paragraph {"className":"hero-description"} -->
<p class="hero-description">Practical tips, honest stories, and budget-friendly<br class="desktop-break"> guides to help you explore the world<br class="desktop-break"> one adventure at a time.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"className":"hero-actions"} -->
<div class="wp-block-buttons hero-actions">
<!-- wp:button {"className":"button explore-button"} -->
<div class="wp-block-button button explore-button"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( home_url( '/destinations' ) ); ?>">Start exploring</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
</div>
<!-- /wp:group -->

<!-- wp:html -->
<svg class="hero-wave" viewBox="0 0 1440 150" preserveAspectRatio="none" aria-hidden="true"><path class="wave-fill" d="M0 42C100-35 182 88 340 97S487 87 565 112s104-35 172-10 153 14 240-2 195-42 267-75 127-36 196-75V150H0Z"/><g class="wave-lines"><path d="M-15 70C91-11 151 73 257 84"/><path d="M-15 86C77 12 145 94 249 101"/><path d="M-15 104C78 32 130 109 225 116"/><path d="M-15 125C64 53 132 135 223 131"/></g></svg>
<!-- /wp:html -->
</section>
<!-- /wp:group -->
