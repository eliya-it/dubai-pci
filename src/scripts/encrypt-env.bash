# Encrypt .env to .env.enc
openssl enc -aes-256-cbc -pbkdf2 -salt -in .env -out .env.enc -pass pass:$MASTER_KEY
