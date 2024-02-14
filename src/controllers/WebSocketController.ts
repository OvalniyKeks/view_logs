export class WebSocketController {
	public socket: WebSocket;
	private pingInterval: number = 0;

	constructor(url: string) {
		this.socket = new WebSocket(url);
	}

	send(data: unknown) {
		if (!this.socket) {
			throw new Error('Socket is not connected');
		}

		if (this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.error('WebSocket is not open');
		}

	}

	close(): void {
		this.socket?.close();
	}

	setupPing() {
		let counter = 0;

		this.pingInterval = window.setInterval(() => {
			this.send([20, counter]);
			counter++
		}, 60000)

		this.socket.addEventListener('close', () => {
			clearInterval(this.pingInterval);

			this.pingInterval = 0;
		})
	}
}
