#!/usr/bin/with-contenv bashio

bashio::log.info "Starting Smart Home Control Panel..."

# Read configuration from addon options
export HOMEASSISTANT_URL=$(bashio::config 'homeassistant_url')
export HOMEASSISTANT_TOKEN=$(bashio::config 'homeassistant_token')
export ALLOWED_IPS=$(bashio::config 'allowed_ips' | jq -r 'join(",")')

# If using Supervisor API, use internal URL
if bashio::var.has_value "${HOMEASSISTANT_TOKEN}"; then
    bashio::log.info "Using provided Home Assistant token"
else
    bashio::log.info "No token provided, using Supervisor API"
    export HOMEASSISTANT_URL="http://supervisor/core"
    export SUPERVISOR_TOKEN="${SUPERVISOR_TOKEN}"
fi

# Log configuration (without sensitive data)
bashio::log.info "Home Assistant URL: ${HOMEASSISTANT_URL}"
bashio::log.info "Allowed IPs: ${ALLOWED_IPS:-none (all allowed)}"

# Start the application
bashio::log.info "Starting Node.js application..."
cd /app
exec node dist/index.js
