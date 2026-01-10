# SSL Certificates

This directory should contain SSL certificates if you're using origin SSL with Cloudflare.

## Option 1: Cloudflare Flexible SSL (Recommended for simplicity)
- No certificates needed in this folder
- Cloudflare handles SSL termination
- Enable "Flexible" SSL mode in Cloudflare dashboard

## Option 2: Cloudflare Full (Strict) SSL
1. Go to Cloudflare Dashboard → SSL/TLS → Origin Server
2. Create a certificate
3. Save the certificate as `cert.pem`
4. Save the private key as `key.pem`
5. Uncomment the HTTPS server block in `nginx.conf`

## Option 3: Let's Encrypt (Alternative)
Use certbot to generate certificates:
```bash
certbot certonly --standalone -d backend.tracce.lol
```

## Files expected:
- `cert.pem` - SSL certificate
- `key.pem` - Private key
