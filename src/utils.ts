import {pipe} from "rxjs";
import {map} from "rxjs/operators";

/**
 * Determines the tick size based on the given price according to KRX's improved tick size criteria.
 *
 * @param {number} price - The base price
 * @returns {number} The tick size corresponding to the provided price
 */
export function getTickSize(price: number) {
  /**
   * Determines the tick size based on the given price according to KRX's improved tick size criteria.
   *
   * Improved criteria (example):
   *   - ~ 1,999원       : 1원
   *   - 2,000원 ~ 4,999원: 5원
   *   - 5,000원 ~ 19,999원: 10원
   *   - 20,000원 ~ 49,999원: 50원
   *   - 50,000원 ~ 199,999원: 100원
   *   - 200,000원 ~ 499,999원: 500원
   *   - 500,000원 이상  : 1,000원
   */
  if (price < 2000) {
    return 1;
  } else if (price < 5000) {
    return 5;
  } else if (price < 20000) {
    return 10;
  } else if (price < 50000) {
    return 50;
  } else if (price < 200000) {
    return 100;
  } else if (price < 500000) {
    return 500;
  } else {
    return 1000;
  }
}

export function getPriceByTick(basePrice: number, tick: number): number {
    const tickSize = getTickSize(basePrice);
    return basePrice + tick * tickSize;
}

export function getNearestTickPrice(price: number): number {
    const tickSize = getTickSize(price);
    return Math.round(price / tickSize) * tickSize;
}

export function tag<T extends Record<string, unknown>>(tag: any) {
    return pipe(
        map((v: T) => ({
            ...v,
            tag : tag instanceof Object ? { ...(v.tag instanceof Object ? v.tag : {}) ,...tag}  : tag,          // <-- add the tag
        }))
    );
};


export type EventType = string | symbol;

// An event handler can take an optional event argument
// and should not return a value
export type Handler<T = unknown> = (event: T) => void;
export type WildcardHandler<T = Record<string, unknown>> = (
    type: keyof T,
    event: T[keyof T]
) => void;

// An array of all currently registered event handlers for a type
export type EventHandlerList<T = unknown> = Array<Handler<T>>;
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<
    WildcardHandler<T>
>;

// A map of event types and their corresponding event handlers.
export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
    keyof Events | '*',
    EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>;

export interface Emitter<Events extends Record<EventType, unknown>> {
    all: EventHandlerMap<Events>;

    on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void;
    on(type: '*', handler: WildcardHandler<Events>): void;

    off<Key extends keyof Events>(
        type: Key,
        handler?: Handler<Events[Key]>
    ): void;
    off(type: '*', handler: WildcardHandler<Events>): void;

    emit<Key extends keyof Events>(type: Key, event: Events[Key]): void;
    emit<Key extends keyof Events>(
        type: undefined extends Events[Key] ? Key : never
    ): void;
}

/**
 * Mitt: Tiny (~200b) functional event emitter / pubsub.
 * @name mitt
 * @returns {Mitt}
 */
export function mitt<Events extends Record<EventType, unknown>>(
    all?: EventHandlerMap<Events>
): Emitter<Events> {
    type GenericEventHandler =
        | Handler<Events[keyof Events]>
        | WildcardHandler<Events>;
    all = all || new Map();

    return {
        /**
         * A Map of event names to registered handler functions.
         */
        all,

        /**
         * Register an event handler for the given type.
         * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
         * @param {Function} handler Function to call in response to given event
         * @memberOf mitt
         */
        on<Key extends keyof Events>(type: Key, handler: GenericEventHandler) {
            const handlers: Array<GenericEventHandler> | undefined = all!.get(type);
            if (handlers) {
                handlers.push(handler);
            } else {
                all!.set(type, [handler] as EventHandlerList<Events[keyof Events]>);
            }
        },

        /**
         * Remove an event handler for the given type.
         * If `handler` is omitted, all handlers of the given type are removed.
         * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
         * @param {Function} [handler] Handler function to remove
         * @memberOf mitt
         */
        off<Key extends keyof Events>(type: Key, handler?: GenericEventHandler) {
            const handlers: Array<GenericEventHandler> | undefined = all!.get(type);
            if (handlers) {
                if (handler) {
                    handlers.splice(handlers.indexOf(handler) >>> 0, 1);
                } else {
                    all!.set(type, []);
                }
            }
        },

        /**
         * Invoke all handlers for the given type.
         * If present, `'*'` handlers are invoked after type-matched handlers.
         *
         * Note: Manually firing '*' handlers is not supported.
         *
         * @param {string|symbol} type The event type to invoke
         * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
         * @memberOf mitt
         */
        emit<Key extends keyof Events>(type: Key, evt?: Events[Key]) {
            let handlers = all!.get(type);
            if (handlers) {
                (handlers as EventHandlerList<Events[keyof Events]>)
                    .slice()
                    .map((handler) => {
                        handler(evt!);
                    });
            }

            handlers = all!.get('*');
            if (handlers) {
                (handlers as WildCardEventHandlerList<Events>)
                    .slice()
                    .map((handler) => {
                        handler(type, evt!);
                    });
            }
        }
    };
}
