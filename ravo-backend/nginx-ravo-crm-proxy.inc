# Incluído pelos locations da API do RAVO CRM
if ($request_method = OPTIONS) {
    add_header Access-Control-Allow-Origin  $ravo_cors_origin always;
    add_header Access-Control-Allow-Methods "GET, POST, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "authorization, content-type, apikey, prefer, accept, accept-profile, content-profile, x-client-info" always;
    add_header Access-Control-Max-Age 86400 always;
    add_header Vary Origin always;
    return 204;
}
proxy_hide_header Access-Control-Allow-Origin;
proxy_hide_header Access-Control-Allow-Credentials;
add_header Access-Control-Allow-Origin  $ravo_cors_origin always;
add_header Access-Control-Expose-Headers "content-range, content-location" always;
add_header Vary Origin always;
proxy_pass http://127.0.0.1:3001;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_read_timeout 60s;
