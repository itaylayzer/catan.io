type EventCallback = (...args: any[]) => void;

class EventDispatcher {
    private events: Record<string, EventCallback[]> = {};

    on(event: string, callback: EventCallback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    once(event: string, callback: EventCallback) {
        const wrapperCallback = (...args: any[]) => {
            callback(...args); // Call the original callback
            this.off(event, wrapperCallback); // Remove the listener after execution
        };
        this.on(event, wrapperCallback);
    }

    off(event: string, callback: EventCallback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }

    emit(event: string, ...args: any[]) {
        console.log("fired:", JSON.stringify(event));
        if (!this.events[event]) return;
        this.events[event].forEach((callback) => callback(...args));
    }
}

export { EventDispatcher, type EventCallback };
