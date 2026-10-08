# RAVO CRM API — api-crm.ravocompany.com.br
map $http_origin $ravo_cors_origin {
    default                              "";
    "https://crm.ravocompany.com.br"     $http_origin;
    "https://dashravo.vercel.app"        $http_origin;
    "http://localhost:5173"              $http_origin;
}
limit_req_zone $binary_remote_addr zone=ravo_login:10m rate=10r/m;

server {
    listen 80;
    listen [::]:80;
    server_name __DOMAIN__;

    client_max_body_size 2m;

    # O cliente (@supabase/supabase-js) sempre prefixa as rotas com /rest/v1;
    # o PostgREST puro serve na raiz. Removemos o prefixo antes de escolher o location.
    rewrite ^/rest/v1/(.*)$ /$1;

    location = /rpc/login {
        limit_req zone=ravo_login burst=5 nodelay;
        limit_req_status 429;
        include /etc/nginx/ravo-crm-proxy.inc;
    }
    location / {
        include /etc/nginx/ravo-crm-proxy.inc;
    }
}
