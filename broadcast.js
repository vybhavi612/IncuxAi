// Real-time synchronization layer using the browser's BroadcastChannel API

const Broadcast = (() => {
  const CHANNEL_NAME = 'intern_management_system_sync';
  let channel = null;
  const subscribers = new Set();

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    
    channel.onmessage = (event) => {
      const { action, payload, sender } = event.data;
      // Trigger all local subscribers
      subscribers.forEach(callback => {
        try {
          callback(action, payload, sender);
        } catch (err) {
          console.error('Error executing broadcast subscriber callback:', err);
        }
      });
    };
  } catch (err) {
    console.warn('BroadcastChannel not supported or failed to initialize:', err);
  }

  return {
    // Publish an event to all other open tabs
    publish(action, payload = {}) {
      if (!channel) return;
      
      const session = window.DB ? window.DB.getCurrentSession() : null;
      const senderId = session ? session.userId : 'system';

      channel.postMessage({
        action,
        payload,
        sender: senderId
      });

      // Also trigger locally so the current tab can handle its own state changes standardly
      subscribers.forEach(callback => {
        try {
          callback(action, payload, senderId);
        } catch (err) {
          console.error('Error executing local broadcast callback:', err);
        }
      });
    },

    // Subscribe to state change notifications
    subscribe(callback) {
      if (typeof callback === 'function') {
        subscribers.add(callback);
      }
      // Return unsubscriber function
      return () => {
        subscribers.delete(callback);
      };
    }
  };
})();

window.Broadcast = Broadcast;
