#!/bin/bash -xe

#------------------ 0.HELPER FUNCTIONS

# Checks to see if an env is defined (not null) in the bash session
is_defined () {
    for var in "$@" ; do
        if [ ! -z "${!var}" ] & [ "${!var}" != "null" ]; then
            echo "$var is set to ${!var}"
        else
            echo "$var is not set"
            return 1
        fi
    done
}

# Checks if desired db secrets in secrets manager are ready
# Db secrets are only fully ready when the RDS DB is ready
db_secrets_ready () {
    if ! is_defined "AWS_REGION" "DB_SECRETS_PATH";then
        return 0
    fi

    echo "Retrieving secrets..." 
    DB_SECRETS_JSON=$(aws secretsmanager get-secret-value --secret-id $DB_SECRETS_PATH --region $AWS_REGION | jq -r '.SecretString')

    echo "Retrieved secrets." 
    MYSQL_HOST=$(echo $DB_SECRETS_JSON | jq -r '.host')
    MYSQL_PORT=$(echo $DB_SECRETS_JSON | jq -r '.port')
    MYSQL_USER=$(echo $DB_SECRETS_JSON | jq -r '.username')
    MYSQL_PASSWORD=$(echo $DB_SECRETS_JSON | jq -r '.password')
    MYSQL_DB_NAME=$(echo $DB_SECRETS_JSON | jq -r '.dbname')

    echo "Checking secrets..." 
    if ! is_defined "MYSQL_USER" "MYSQL_PASSWORD" "MYSQL_HOST" "MYSQL_PORT" "MYSQL_DB_NAME";then
        echo "Secrets are not ready." 
        return 1
    fi

    echo "Secrets are ready." 
    return 0
}

#------------------  1.SET SCRIPT GLOBAL VARIABLES

# Read the first parameter into $SITE
if [[ "$1" != "" ]]; then
    SITE="$1"
else
    echo "Please specify the location of the Site you are trying to deploy."
    exit 1
fi

# Read the second parameter into $API
if [[ "$2" != "" ]]; then
    API="$2"
else
    echo "Please specify the location of the API you are trying to deploy."
    exit 1
fi

# Read the third parameter into $AWS_REGION
if [[ "$3" != "" ]]; then
    AWS_REGION="$3"
else
    echo "Please specify env region."
    exit 1
fi

# Read the fourth parameter into $DB_SECRETS_PATH
if [[ "$4" != "" ]]; then
    DB_SECRETS_PATH="$4"
else
    echo "Please specify secrets path of the database."
    exit 1
fi

#------------------  2.SETUP INSTALLATION

# Install OS packages
sudo su
yum update -y
amazon-linux-extras install -y nginx1
curl --silent --location https://rpm.nodesource.com/setup_16.x | bash -
yum -y install nodejs jq
npm i -g pm2 yarn

# Wait for Secrets Manager to have RDS secret ready
# Certain database secrets (e.g host, port) won't be ready until the database is ready
echo "Waiting up to 20 minutes for Secrets Manager to be ready with Secrets";
for i in {1..240}; do
    echo "try count: $i"
    db_secrets_ready && break;
    # retry every 30 seconds
    sleep 30s; 
done
echo "Secrets Manager is ready with Secrets";
# Use the AWS CLI to get secrets from Secrets Manager
DB_SECRETS_JSON=$(aws secretsmanager get-secret-value --secret-id $DB_SECRETS_PATH --region $AWS_REGION | jq -r '.SecretString')
MYSQL_HOST=$(echo $DB_SECRETS_JSON | jq -r '.host')
MYSQL_PORT=$(echo $DB_SECRETS_JSON | jq -r '.port')
MYSQL_USER=$(echo $DB_SECRETS_JSON | jq -r '.username')
MYSQL_PASSWORD=$(echo $DB_SECRETS_JSON | jq -r '.password')
MYSQL_DB_NAME=$(echo $DB_SECRETS_JSON | jq -r '.dbname')

# Install API
mkdir -p /app
cp $API /app/API.zip
cd /app
unzip API.zip
rm API.zip
yarn install --frozen-lockfile
## set up the env
echo "MYSQL_HOST=$MYSQL_HOST" >> .env
echo "MYSQL_PORT=$MYSQL_PORT" >> .env
echo "MYSQL_USER=$MYSQL_USER" >> .env
echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >> .env
echo "MYSQL_DB_NAME=$MYSQL_DB_NAME" >> .env
## run migration and db seed
node ace migration:run
node ace db:seed
## start server
pm2 start server.js

# Install site
mkdir -p /var/www/Site
cp $SITE /var/www/Site/Site.zip
cd /var/www/Site
unzip Site.zip
rm Site.zip
usermod -a -G nginx ec2-user
chown ec2-user:nginx -R ./*
chown ec2-user:nginx /var/www
chown ec2-user:nginx /var/www/Site

# Copy the nginx config file, then ensure nginx starts at boot, and restart it to load the config
cp nginx-app.conf /etc/nginx/conf.d/site.conf
rm nginx-app.conf
systemctl enable nginx
systemctl stop nginx
systemctl restart nginx