FROM node:22

# System-Pakete aktualisieren und benötigte Tools installieren
RUN apt-get update && apt-get install -y \
    lsb-release \
    gnupg2 \
    && rm -rf /var/lib/apt/lists/*

# PostgreSQL Repository und GPG Key einrichten
RUN echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg

# PostgreSQL Client installieren
RUN apt-get update \
    && apt-get install -y postgresql-client-17 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Node.js-App in Container kopieren
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "prod"]