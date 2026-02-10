// Real-time connection management and broadcasting utilities

// Global array to store active connections
let connections: ReadableStreamDefaultController<Uint8Array>[] = [];

// Add a new connection
export function addConnection(controller: ReadableStreamDefaultController<Uint8Array>) {
  connections.push(controller);
  console.log(`🔗 Total connections: ${connections.length}`);
}

// Remove a dead connection
export function removeConnection(controller: ReadableStreamDefaultController<Uint8Array>) {
  const index = connections.indexOf(controller);
  if (index > -1) {
    connections.splice(index, 1);
    console.log(`🗑️ Removed connection. Total: ${connections.length}`);
  }
}

// Function to broadcast updates to all connected clients
export function broadcastUpdate(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);
  
  // Iterate over a shallow copy so we can remove dead connections during iteration
  connections.slice().forEach(controller => {
    try {
      controller.enqueue(encodedMessage);
    } catch (error) {
      console.error('Error broadcasting to a connection, removing it:', error);
      removeConnection(controller);
    }
  });
}

// Get connection count
export function getConnectionCount(): number {
  return connections.length;
}
