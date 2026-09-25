#!/bin/sh
set -eu

if ! wp core is-installed >/dev/null 2>&1; then
  wp core install --url="$WP_URL" --title="Wei's Tiny Adventures" \
    --admin_user="$WP_ADMIN_USER" --admin_password="$WP_ADMIN_PASSWORD" \
    --admin_email="$WP_ADMIN_EMAIL" --skip-email
  wp option update timezone_string Australia/Sydney
  wp option update blog_public 0
  wp option update blogdescription 'Affordable travel. Real experiences.'
fi

wp plugin activate weis-travel-tools
wp theme activate weis-tiny-adventures
wp eval-file /opt/wei-setup/import.php --user="$WP_ADMIN_USER"
wp rewrite flush
printf '\nWordPress is ready at %s\nDashboard: %s/wp-admin/\n' "$WP_URL" "$WP_URL"
