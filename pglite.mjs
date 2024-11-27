import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'node:net';
import { fromNodeSocket } from 'pg-gateway/node';

export const connectionString = 'postgres://root:root@localhost:5432/myapp'
export const db = new PGlite();

import fs from 'node:fs'

db.waitReady.then(async ()=> {
    console.debug('DB Initialization: schema')
    await db.exec(fs.readFileSync('./schema.sql', 'utf8'))
    console.debug('DB Initialization: seed')
    await db.exec(fs.readFileSync('./seed.sql', 'utf8'))
    console.debug('DB Initialization: done')
})

const server = createServer(async (socket) => {
  // Each connection gets a fresh PGlite database,
  // since PGlite runs in single-user mode
  // (alternatively you could queue connections)

  const connection = await fromNodeSocket(socket, {
    serverVersion: '16.3',

    auth: {
      // No password required
      method: 'trust',
    },

    async onStartup() {
      // Wait for PGlite to be ready before further processing
      await db.waitReady;
    },

    // Hook into each client message
    async onMessage(data, { isAuthenticated }) {
      // Only forward messages to PGlite after authentication
      if (!isAuthenticated) {
        return;
      }

      // Forward raw message to PGlite and send response to client
      return await db.execProtocolRaw(data);
    },
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

server.listen(5432, () => {
  console.log('Server listening on port 5432');
});