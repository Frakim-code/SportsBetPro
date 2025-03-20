import { create } from 'zustand';

interface GameUpdate {
  type: "UPDATE_GAME";
  gameId: string;
  status: string;
  odds?: string;
}

interface BetUpdate {
  type: "UPDATE_BET";
  betId: number;
  status: string;
}

type WSMessage = GameUpdate | BetUpdate;

interface WebSocketStore {
  socket: WebSocket | null;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = create<WebSocketStore>((set) => ({
  socket: null,
  connected: false,
  connect: () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log('Connecting to WebSocket:', wsUrl);

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      set({ connected: true });
    };

    socket.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', message);

        switch (message.type) {
          case "UPDATE_GAME":
            window.dispatchEvent(new CustomEvent('gameUpdate', { detail: message }));
            break;
          case "UPDATE_BET":
            window.dispatchEvent(new CustomEvent('betUpdate', { detail: message }));
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ connected: false });
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      set({ connected: false });

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        useWebSocket.getState().connect();
      }, 5000);
    };

    set({ socket });
  },
  disconnect: () => {
    const { socket } = useWebSocket.getState();
    if (socket) {
      console.log('Closing WebSocket connection');
      socket.close();
      set({ socket: null, connected: false });
    }
  }
}));