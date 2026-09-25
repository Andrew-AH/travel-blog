<?php
/** Private newsletter collection. This module never sends email. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function wei_newsletter_table() {
	global $wpdb;
	return $wpdb->prefix . 'wei_newsletter_subscribers';
}

function wei_newsletter_consent_text() {
	return 'I agree to receive destination ideas, travel tips, and affordable travel inspiration from Wei’s Tiny Adventures. I can unsubscribe at any time.';
}

function wei_newsletter_install() {
	if ( '1' === get_option( 'wei_newsletter_schema_version' ) ) {
		return;
	}
	global $wpdb;
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	$table = wei_newsletter_table();
	$collation = $wpdb->get_charset_collate();
	dbDelta( "CREATE TABLE {$table} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		email varchar(254) NOT NULL,
		first_name varchar(80) NOT NULL DEFAULT '',
		consent_text text NOT NULL,
		consent_version varchar(32) NOT NULL,
		consent_at datetime NOT NULL,
		status varchar(20) NOT NULL DEFAULT 'subscribed',
		token_hash char(64) NOT NULL,
		token_box text NOT NULL,
		unsubscribed_at datetime DEFAULT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY email (email),
		UNIQUE KEY token_hash (token_hash),
		KEY status (status)
	) {$collation};" );
	if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) ) ) === $table ) {
		update_option( 'wei_newsletter_schema_version', '1', false );
	}
}
add_action( 'init', 'wei_newsletter_install', 5 );

/** Encrypt recoverable export tokens; public lookups use only their SHA-256 hashes. */
function wei_newsletter_encrypt_token( $token ) {
	if ( ! function_exists( 'openssl_encrypt' ) ) {
		return false;
	}
	$iv = random_bytes( 12 );
	$tag = '';
	$key = hash( 'sha256', wp_salt( 'auth' ) . 'wei-newsletter-token-v1', true );
	$ciphertext = openssl_encrypt( $token, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );
	return false === $ciphertext ? false : base64_encode( $iv . $tag . $ciphertext );
}

function wei_newsletter_decrypt_token( $box ) {
	if ( ! function_exists( 'openssl_decrypt' ) ) {
		return false;
	}
	$binary = base64_decode( $box, true );
	if ( false === $binary || strlen( $binary ) < 29 ) {
		return false;
	}
	$key = hash( 'sha256', wp_salt( 'auth' ) . 'wei-newsletter-token-v1', true );
	return openssl_decrypt( substr( $binary, 28 ), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, substr( $binary, 0, 12 ), substr( $binary, 12, 16 ) );
}

function wei_newsletter_response( $data, $status = 200, $headers = array() ) {
	return new WP_REST_Response( $data, $status, array_merge( array( 'Cache-Control' => 'no-store', 'X-Content-Type-Options' => 'nosniff' ), $headers ) );
}

/** Anonymous forms use JSON and same-origin checks, so cached pages need no expiring nonce. */
function wei_newsletter_request_permission( WP_REST_Request $request ) {
	if ( 'cross-site' === strtolower( (string) $request->get_header( 'sec-fetch-site' ) ) ) {
		return new WP_Error( 'wei_newsletter_origin', 'Please submit the form from our website.', array( 'status' => 403 ) );
	}
	$origin = $request->get_header( 'origin' );
	if ( $origin ) {
		$parts = wp_parse_url( $origin );
		$expected = wp_parse_url( home_url( '/' ) );
		$origin_port = isset( $parts['port'] ) ? (int) $parts['port'] : ( isset( $parts['scheme'] ) && 'https' === $parts['scheme'] ? 443 : 80 );
		$expected_port = isset( $expected['port'] ) ? (int) $expected['port'] : ( 'https' === $expected['scheme'] ? 443 : 80 );
		if ( ! is_array( $parts ) || empty( $parts['host'] ) || empty( $parts['scheme'] ) || strtolower( $parts['host'] ) !== strtolower( $expected['host'] ) || $parts['scheme'] !== $expected['scheme'] || $origin_port !== $expected_port ) {
			return new WP_Error( 'wei_newsletter_origin', 'Please submit the form from our website.', array( 'status' => 403 ) );
		}
	}
	if ( ! preg_match( '~^application/json(?:\s*;|$)~i', (string) $request->get_header( 'content-type' ) ) || strlen( $request->get_body() ) > 4096 ) {
		return new WP_Error( 'wei_newsletter_body', 'Please send a small, valid JSON request.', array( 'status' => 400 ) );
	}
	return true;
}

function wei_newsletter_rate_limit( $route ) {
	// Deliberately ignore untrusted forwarding headers. Configure the web server for a trusted proxy.
	$address = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : 'unknown';
	$key = 'wei_newsletter_rate_' . substr( hash_hmac( 'sha256', $route . ':' . $address, wp_salt( 'nonce' ) ), 0, 40 );
	$entry = get_transient( $key );
	$now = time();
	if ( ! is_array( $entry ) || $entry['reset'] <= $now ) {
		$entry = array( 'count' => 0, 'reset' => $now + 15 * MINUTE_IN_SECONDS );
	}
	$entry['count']++;
	set_transient( $key, $entry, max( 1, $entry['reset'] - $now ) );
	return $entry['count'] > 10 ? max( 1, $entry['reset'] - $now ) : 0;
}

function wei_newsletter_subscribe( WP_REST_Request $request ) {
	$retry = wei_newsletter_rate_limit( 'subscribe' );
	if ( $retry ) {
		return wei_newsletter_response( array( 'error' => 'Too many attempts. Please try again in a little while.' ), 429, array( 'Retry-After' => (string) $retry ) );
	}
	$body = $request->get_json_params();
	if ( ! is_array( $body ) || ( array_key_exists( 'website', $body ) && ( ! is_string( $body['website'] ) || '' !== trim( $body['website'] ) ) ) ) {
		return wei_newsletter_response( array( 'error' => 'We couldn’t accept this submission. Please check the form.' ), 400 );
	}
	$email = isset( $body['email'] ) && is_string( $body['email'] ) ? strtolower( trim( $body['email'] ) ) : '';
	$name = isset( $body['firstName'] ) && is_string( $body['firstName'] ) ? trim( $body['firstName'] ) : '';
	$errors = array();
	if ( strlen( $email ) > 254 || ! is_email( $email ) ) {
		$errors['email'] = 'Enter a valid email address, like you@example.com.';
	}
	if ( ( array_key_exists( 'firstName', $body ) && ! is_string( $body['firstName'] ) ) || ( function_exists( 'mb_strlen' ) ? mb_strlen( $name ) : strlen( $name ) ) > 80 || preg_match( '/[\x00-\x1f\x7f]/', $name ) ) {
		$errors['firstName'] = 'Use a first name of 80 characters or fewer.';
	}
	if ( ! isset( $body['consent'] ) || true !== $body['consent'] ) {
		$errors['consent'] = 'Please tick the box to join the mailing list.';
	}
	if ( $errors ) {
		return wei_newsletter_response( array( 'error' => 'Please check the highlighted fields.', 'fieldErrors' => $errors ), 400 );
	}
	try {
		$token = rtrim( strtr( base64_encode( random_bytes( 32 ) ), '+/', '-_' ), '=' );
		$box = wei_newsletter_encrypt_token( $token );
		if ( false === $box ) {
			throw new RuntimeException( 'Token encryption unavailable.' );
		}
		global $wpdb;
		$table = wei_newsletter_table();
		// Leave existing rows untouched, then atomically update only an opted-out row.
		// Keeping the status predicate in WHERE also works with WordPress's SQLite integration.
		$consent_at = current_time( 'mysql', true );
		$result = $wpdb->query( $wpdb->prepare(
			"INSERT INTO {$table} (email, first_name, consent_text, consent_version, consent_at, status, token_hash, token_box)
			VALUES (%s, %s, %s, %s, %s, 'subscribed', %s, %s)
			ON DUPLICATE KEY UPDATE email = email",
			$email, sanitize_text_field( $name ), wei_newsletter_consent_text(), '2026-09-24', $consent_at, hash( 'sha256', $token ), $box
		) );
		if ( false === $result ) {
			throw new RuntimeException( 'Subscription storage unavailable.' );
		}
		$result = $wpdb->update( $table, array(
			'first_name' => sanitize_text_field( $name ),
			'consent_text' => wei_newsletter_consent_text(),
			'consent_version' => '2026-09-24',
			'consent_at' => $consent_at,
			'token_hash' => hash( 'sha256', $token ),
			'token_box' => $box,
			'unsubscribed_at' => null,
			'status' => 'subscribed',
		), array( 'email' => $email, 'status' => 'unsubscribed' ) );
		if ( false === $result ) {
			throw new RuntimeException( 'Subscription storage unavailable.' );
		}
	} catch ( Throwable $error ) {
		return wei_newsletter_response( array( 'error' => 'We couldn’t save your subscription. Please try again shortly.' ), 503 );
	}
	// Identical response for new, existing, and resubscribed readers: never disclose membership.
	return wei_newsletter_response( array( 'ok' => true ) );
}

function wei_newsletter_unsubscribe( WP_REST_Request $request ) {
	$retry = wei_newsletter_rate_limit( 'unsubscribe' );
	if ( $retry ) {
		return wei_newsletter_response( array( 'error' => 'Too many attempts. Please try again in a little while.' ), 429, array( 'Retry-After' => (string) $retry ) );
	}
	$body = $request->get_json_params();
	$token = is_array( $body ) && isset( $body['token'] ) && is_string( $body['token'] ) ? $body['token'] : '';
	if ( ! preg_match( '/^[A-Za-z0-9_-]{43}$/D', $token ) ) {
		return wei_newsletter_response( array( 'error' => 'This unsubscribe link is incomplete. Please use the link in your newsletter.' ), 400 );
	}
	global $wpdb;
	$table = wei_newsletter_table();
	$hash = hash( 'sha256', $token );
	$subscriber = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE token_hash = %s", $hash ) );
	if ( $wpdb->last_error ) {
		return wei_newsletter_response( array( 'error' => 'We couldn’t update your subscription. Please try again shortly.' ), 503 );
	}
	if ( ! $subscriber ) {
		return wei_newsletter_response( array( 'error' => 'This unsubscribe link is no longer valid. Please use the link in your latest newsletter.' ), 400 );
	}
	$result = $wpdb->query( $wpdb->prepare( "UPDATE {$table} SET status = 'unsubscribed', unsubscribed_at = %s WHERE token_hash = %s AND status = 'subscribed'", current_time( 'mysql', true ), $hash ) );
	return false === $result
		? wei_newsletter_response( array( 'error' => 'We couldn’t update your subscription. Please try again shortly.' ), 503 )
		: wei_newsletter_response( array( 'ok' => true ) );
}

function wei_newsletter_routes() {
	foreach ( array( 'subscribe', 'unsubscribe' ) as $action ) {
		register_rest_route( 'wei/v1', '/newsletter/' . $action, array(
			'methods' => WP_REST_Server::CREATABLE,
			'callback' => 'wei_newsletter_' . $action,
			'permission_callback' => 'wei_newsletter_request_permission',
		) );
	}
}
add_action( 'rest_api_init', 'wei_newsletter_routes' );

function wei_newsletter_page_url( $slug ) {
	$page = get_page_by_path( $slug );
	return $page && 'publish' === $page->post_status ? get_permalink( $page ) : home_url( '/' . $slug . '/' );
}

function wei_newsletter_assets() {
	$base = plugin_dir_url( dirname( __DIR__ ) . '/plugin.php' );
	wp_register_script( 'wei-newsletter', $base . 'assets/newsletter.js', array(), '1.0.0', true );
	wp_register_script( 'wei-newsletter-editor', $base . 'assets/newsletter-editor.js', array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components' ), '1.0.0', true );
	wp_register_style( 'wei-newsletter', $base . 'assets/newsletter.css', array(), '1.0.0' );
	$blocks = array(
		'newsletter-signup' => array( 'buttonLabel' => array( 'type' => 'string', 'default' => 'Join the journey' ) ),
		'newsletter-unsubscribe' => array(),
		'newsletter-teaser' => array(
			'heading' => array( 'type' => 'string', 'default' => 'Let’s explore the world' ),
			'description' => array( 'type' => 'string', 'default' => 'New tips, stories, and guides delivered to your inbox.' ),
			'buttonLabel' => array( 'type' => 'string', 'default' => 'Join the journey' ),
		),
	);
	foreach ( $blocks as $block => $attributes ) {
		register_block_type( 'wei/' . $block, array(
			'api_version' => 3,
			'attributes' => $attributes,
			'render_callback' => 'wei_newsletter_render_' . str_replace( 'newsletter-', '', $block ),
			'editor_script' => 'wei-newsletter-editor',
			'view_script' => 'wei-newsletter',
			'style' => 'wei-newsletter',
			'supports' => array( 'html' => false ),
		) );
	}
}
add_action( 'init', 'wei_newsletter_assets' );

function wei_newsletter_render_signup( $attributes ) {
	$id = wp_unique_id( 'wei-signup-' );
	ob_start();
	?>
	<div <?php echo get_block_wrapper_attributes( array( 'class' => 'wei-newsletter-signup-block' ) ); ?>>
		<form class="newsletter-signup" data-wei-newsletter-signup data-endpoint="<?php echo esc_url( rest_url( 'wei/v1/newsletter/subscribe' ) ); ?>" novalidate>
			<fieldset class="newsletter-fields">
				<legend class="screen-reader-text sr-only">Your newsletter signup</legend>
				<div class="newsletter-field"><label for="<?php echo esc_attr( $id . 'name' ); ?>">First name <span>(optional)</span></label><input id="<?php echo esc_attr( $id . 'name' ); ?>" name="firstName" type="text" autocomplete="given-name" placeholder="What should I call you?" maxlength="80" aria-describedby="<?php echo esc_attr( $id . 'name-error' ); ?>"><p class="newsletter-field-error" id="<?php echo esc_attr( $id . 'name-error' ); ?>" data-error-for="firstName" hidden></p></div>
				<div class="newsletter-field"><label for="<?php echo esc_attr( $id . 'email' ); ?>">Email address <span>(required)</span></label><input id="<?php echo esc_attr( $id . 'email' ); ?>" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="you@example.com" maxlength="254" required aria-describedby="<?php echo esc_attr( $id . 'email-error' ); ?>"><p class="newsletter-field-error" id="<?php echo esc_attr( $id . 'email-error' ); ?>" data-error-for="email" hidden></p></div>
				<div class="newsletter-consent"><label><input name="consent" type="checkbox" required aria-describedby="<?php echo esc_attr( $id . 'consent-error' ); ?>"><span><?php echo esc_html( wei_newsletter_consent_text() ); ?></span></label><p class="newsletter-field-error" id="<?php echo esc_attr( $id . 'consent-error' ); ?>" data-error-for="consent" hidden></p></div>
				<div class="newsletter-honeypot" aria-hidden="true"><label for="<?php echo esc_attr( $id . 'website' ); ?>">Leave this field empty</label><input id="<?php echo esc_attr( $id . 'website' ); ?>" name="website" type="text" tabindex="-1" autocomplete="off"></div>
				<p class="newsletter-submit-error" data-newsletter-feedback role="alert" hidden></p>
				<button class="newsletter-submit" type="submit"><?php echo esc_html( isset( $attributes['buttonLabel'] ) ? $attributes['buttonLabel'] : 'Join the journey' ); ?></button>
			</fieldset>
			<p class="newsletter-small-note">A few good stories. A little trip inspiration. Always free.</p>
			<noscript><p>Please enable JavaScript to join the newsletter.</p></noscript>
		</form>
		<div class="newsletter-signup newsletter-success" data-newsletter-success role="status" hidden><svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="24" cy="24" r="20"/><path d="m14 24 7 7 13-14"/></svg><h3 tabindex="-1">You’re on the list!</h3><p>Thanks for coming along. Your next little dose of travel inspiration will arrive when there’s something lovely to share.</p><span class="newsletter-success-signoff">See you on the next adventure,<br>Wei</span><a href="<?php echo esc_url( wei_newsletter_page_url( 'destinations' ) ); ?>">Find your next destination <span aria-hidden="true">→</span></a></div>
	</div>
	<?php
	return ob_get_clean();
}

function wei_newsletter_render_unsubscribe() {
	ob_start();
	?>
	<section <?php echo get_block_wrapper_attributes( array( 'class' => 'unsubscribe-main' ) ); ?> data-wei-newsletter-unsubscribe data-endpoint="<?php echo esc_url( rest_url( 'wei/v1/newsletter/unsubscribe' ) ); ?>">
		<svg width="49" height="49" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 24 5l19 14v22H5zM5 19l19 14 19-14M5 41l14-12m24 12L29 29"/></svg>
		<p class="subscribe-script">Letters from Wei</p><h1 tabindex="-1">Need a little less mail?</h1>
		<svg class="wave-flourish" viewBox="0 0 110 15" fill="none" aria-hidden="true"><path d="M2 8c9 0 9 4 17 4s9-7 18-7 9 6 18 6 9-6 18-6 9 6 18 6 9-3 17-3"/></svg>
		<p data-unsubscribe-copy>This link is missing your mailing-list details. Please use the unsubscribe link included with your newsletter.</p>
		<p class="unsubscribe-error" data-newsletter-feedback role="alert" hidden></p>
		<button class="unsubscribe-button" type="button" data-unsubscribe-button hidden>Unsubscribe from the newsletter</button>
		<noscript><p>Please enable JavaScript to update your mailing preference.</p></noscript>
		<a class="unsubscribe-back" href="<?php echo esc_url( home_url( '/' ) ); ?>"><span aria-hidden="true">←</span> Back to the journal</a>
	</section>
	<?php
	return ob_get_clean();
}

function wei_newsletter_render_teaser( $attributes ) {
	$id = wp_unique_id( 'wei-newsletter-email-' );
	$heading = isset( $attributes['heading'] ) ? $attributes['heading'] : 'Let’s explore the world';
	$description = isset( $attributes['description'] ) ? $attributes['description'] : 'New tips, stories, and guides delivered to your inbox.';
	$button = isset( $attributes['buttonLabel'] ) ? $attributes['buttonLabel'] : 'Join the journey';
	ob_start();
	?>
	<div <?php echo get_block_wrapper_attributes( array( 'class' => 'newsletter', 'id' => 'newsletter' ) ); ?> aria-label="Join the newsletter">
		<div class="newsletter-plane" aria-hidden="true"><svg viewBox="0 0 240 95"><path d="M0 67C38 17 86 106 127 75s-10-67-27-27 57 58 114-9"/></svg><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 26 52-18-18 51-11-24L6 26Zm23 9L58 8M29 35l-1 17 12-10"/></svg></div>
		<div class="newsletter-copy"><h2><?php echo esc_html( $heading ); ?></h2><p><?php echo esc_html( $description ); ?></p></div>
		<form class="newsletter-form" data-wei-newsletter-teaser data-signup-url="<?php echo esc_url( wei_newsletter_page_url( 'subscribe' ) ); ?>" action="<?php echo esc_url( wei_newsletter_page_url( 'subscribe' ) ); ?>" method="get"><label class="screen-reader-text sr-only" for="<?php echo esc_attr( $id ); ?>">Your email address</label><input id="<?php echo esc_attr( $id ); ?>" type="email" placeholder="Your email address" autocomplete="email" maxlength="254" required><button class="button journey-button" type="submit"><?php echo esc_html( $button ); ?></button></form>
		<div class="postmark" aria-hidden="true"><svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="50"/><circle cx="55" cy="55" r="46" class="stamp-dashed"/><circle cx="55" cy="55" r="32"/><text x="55" y="23" text-anchor="middle">YOUR NEXT ADVENTURE</text><text x="55" y="89" text-anchor="middle">STARTS HERE</text></svg><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="24" cy="9" r="5"/><path d="M24 14v28M13 21h22M7 28v8h7M41 28v8h-7M7 34c9 13 25 13 34 0"/></svg></div>
	</div>
	<?php
	return ob_get_clean();
}

function wei_newsletter_robots( $robots ) {
	if ( is_page( 'unsubscribe' ) || ( is_singular() && has_block( 'wei/newsletter-unsubscribe' ) ) ) {
		$robots['noindex'] = true;
		$robots['nofollow'] = true;
		unset( $robots['index'], $robots['follow'] );
	}
	return $robots;
}
add_filter( 'wp_robots', 'wei_newsletter_robots' );

function wei_newsletter_admin_menu() {
	add_management_page( 'Newsletter', 'Newsletter', 'manage_options', 'wei-newsletter', 'wei_newsletter_admin_page' );
}
add_action( 'admin_menu', 'wei_newsletter_admin_menu' );

function wei_newsletter_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	global $wpdb;
	$table = wei_newsletter_table();
	$counts = $wpdb->get_results( "SELECT status, COUNT(*) AS total FROM {$table} GROUP BY status", OBJECT_K );
	$subscribed = isset( $counts['subscribed'] ) ? (int) $counts['subscribed']->total : 0;
	$unsubscribed = isset( $counts['unsubscribed'] ) ? (int) $counts['unsubscribed']->total : 0;
	$rows = $wpdb->get_results( "SELECT email, first_name, status, consent_at, unsubscribed_at FROM {$table} ORDER BY id DESC LIMIT 100" );
	?>
	<div class="wrap"><h1>Letters from Wei — Newsletter</h1><p>Collect signups here, then import a fresh active-subscriber export into your mailing provider before every send. This plugin does not send newsletters or confirmation emails.</p><p><strong><?php echo esc_html( number_format_i18n( $subscribed ) ); ?> active</strong> · <?php echo esc_html( number_format_i18n( $unsubscribed ) ); ?> unsubscribed</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"><input type="hidden" name="action" value="wei_newsletter_export"><?php wp_nonce_field( 'wei_newsletter_export' ); ?><button class="button button-primary">Download active subscribers (CSV)</button></form>
		<p>CSV files contain private email addresses, recorded consent and individual unsubscribe links. Include the matching unsubscribe link in each newsletter. Retain your WordPress authentication salts when migrating this site so exported links remain decryptable. Existing issued unsubscribe links remain valid if salts change.</p>
		<h2>Most recent subscribers</h2><p>Showing up to 100 entries. All dates below are UTC.</p><table class="widefat striped"><thead><tr><th scope="col">Email</th><th scope="col">First name</th><th scope="col">Status</th><th scope="col">Consented</th><th scope="col">Unsubscribed</th></tr></thead><tbody>
		<?php if ( ! $rows ) : ?><tr><td colspan="5">No subscribers yet.</td></tr><?php endif; ?>
		<?php foreach ( (array) $rows as $row ) : ?><tr><td><?php echo esc_html( $row->email ); ?></td><td><?php echo esc_html( $row->first_name ); ?></td><td><?php echo esc_html( $row->status ); ?></td><td><?php echo esc_html( $row->consent_at ); ?></td><td><?php echo esc_html( $row->unsubscribed_at ? $row->unsubscribed_at : '—' ); ?></td></tr><?php endforeach; ?>
		</tbody></table>
	</div>
	<?php
}

function wei_newsletter_csv_cell( $value ) {
	$value = (string) $value;
	// Spreadsheet formula injection can hide behind whitespace or control characters.
	return preg_match( '/^[\x00-\x20]*[=+@-]/', $value ) || preg_match( '/^[\t\r\n]/', $value ) ? "'" . $value : $value;
}

function wei_newsletter_export() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'You do not have permission to export newsletter subscribers.', '', array( 'response' => 403 ) );
	}
	check_admin_referer( 'wei_newsletter_export' );
	global $wpdb;
	$table = wei_newsletter_table();
	$rows = $wpdb->get_results( "SELECT email, first_name, consent_text, consent_version, consent_at, token_box FROM {$table} WHERE status = 'subscribed' ORDER BY id", ARRAY_A );
	if ( $wpdb->last_error ) {
		wp_die( 'The subscriber export could not be read. Please try again.', '', array( 'response' => 503 ) );
	}
	foreach ( $rows as &$row ) {
		$token = wei_newsletter_decrypt_token( $row['token_box'] );
		if ( ! is_string( $token ) || ! preg_match( '/^[A-Za-z0-9_-]{43}$/D', $token ) ) {
			wp_die( 'An unsubscribe token could not be decrypted. Restore the original WordPress authentication salts before exporting. No export has been generated.', '', array( 'response' => 503 ) );
		}
		unset( $row['token_box'] );
		$row['unsubscribe_url'] = wei_newsletter_page_url( 'unsubscribe' ) . '#token=' . rawurlencode( $token );
	}
	unset( $row );
	nocache_headers();
	header( 'Content-Type: text/csv; charset=utf-8' );
	header( 'Content-Disposition: attachment; filename="wei-active-subscribers-' . gmdate( 'Y-m-d' ) . '.csv"' );
	header( 'X-Content-Type-Options: nosniff' );
	$output = fopen( 'php://output', 'w' );
	fputcsv( $output, array( 'email', 'first_name', 'consent_text', 'consent_version', 'consent_at_utc', 'unsubscribe_url' ), ',', '"', '' );
	foreach ( $rows as $row ) {
		fputcsv( $output, array_map( 'wei_newsletter_csv_cell', array_values( $row ) ), ',', '"', '' );
	}
	fclose( $output );
	exit;
}
add_action( 'admin_post_wei_newsletter_export', 'wei_newsletter_export' );
