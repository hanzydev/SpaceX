#!/bin/bash

# update pkg lists
sudo $pkg_manager $update_cmd

# install dependencies
sudo $pkg_manager $install_cmd $yes_to_all ca-certificates curl git gnupg unzip

# add nodesource GPG key and repo
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# update pkg index after adding new repo
sudo $pkg_manager $update_cmd

# explicitly install node.js from nodesource repo
sudo $pkg_manager $install_cmd $yes_to_all nodejs

# install bun, yarn and pm2
sudo npm i -g bun yarn pm2

# install postgresql
sudo $pkg_manager $install_cmd $yes_to_all postgresql postgresql-contrib
sudo systemctl start postgresql.service

# create database user
sudo -Hiu postgres psql -c "CREATE USER spacex WITH PASSWORD '$db_pass';"