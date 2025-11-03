# Use the official lightweight Node.js base image.
FROM node:16

# Create app directory (inside the image)
WORKDIR /usr/src/app

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

# If you are using yarn, copy yarn.lock as well
# COPY yarn.lock .

RUN npm install
# Or if you're using yarn, run:
# RUN yarn install

# Bundle app source inside Docker image
COPY . .

# Change ownership of the copied files
RUN chown -R www-data:www-data /var/www/html

# Build your Next.js app
RUN npm run build

# Your app binds to port 3000, make sure the container does too
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD ["npm", "start"]
