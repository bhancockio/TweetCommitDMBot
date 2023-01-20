#!/bin/bash
apt-get -y update
cat > /tmp/subscript.sh << EOF
# START UBUNTU USERSPACE
echo "Setting up NodeJS Environment"
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.9/install.sh | bash
echo 'export NVM_DIR="/home/ubuntu/.nvm"' >> /home/ubuntu/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm' >> /home/ubuntu/.bashrc

# Dot source the files to ensure that variables are available within the current shell
. /home/ubuntu/.nvm/nvm.sh
. /home/ubuntu/.profile
. /home/ubuntu/.bashrc

# Install NVM, NPM, Node.JS & Grunt
nvm install --lts
npm i -g yarn
nvm ls

# Clone TweetCommitDMBot Repo
git clone https://github.com/bhancockio/TweetCommitDMBot.git
cd TweetCommitDMBot/TwitterStreamConsumer
yarn

EOF

# Install script
chown ubuntu:ubuntu /tmp/subscript.sh && chmod a+x /tmp/subscript.sh
sleep 1; su - ubuntu -c "/tmp/subscript.sh"

# Setup Twitter Stream Consumer Service
export TWITTER_CODE="/home/ubuntu/TweetCommitDMBot/TwitterStreamConsumer"
export TWITTER_SERVICE_FILE="twitter_stream_consumer.service"
chmod +x ${TWITTER_CODE}/index.js
cp ${TWITTER_CODE}/scripts/${TWITTER_SERVICE_FILE} /etc/systemd/system/${TWITTER_SERVICE_FILE}
systemctl enable ${TWITTER_SERVICE_FILE}