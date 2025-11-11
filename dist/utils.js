"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTickSize = getTickSize;
exports.getPriceByTick = getPriceByTick;
exports.getNearestTickPrice = getNearestTickPrice;
exports.tag = tag;
exports.mitt = mitt;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
/**
 * Determines the tick size based on the given price according to KRX's improved tick size criteria.
 *
 * @param {number} price - The base price
 * @returns {number} The tick size corresponding to the provided price
 */
function getTickSize(price) {
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
    }
    else if (price < 5000) {
        return 5;
    }
    else if (price < 20000) {
        return 10;
    }
    else if (price < 50000) {
        return 50;
    }
    else if (price < 200000) {
        return 100;
    }
    else if (price < 500000) {
        return 500;
    }
    else {
        return 1000;
    }
}
function getPriceByTick(basePrice, tick) {
    const tickSize = getTickSize(basePrice);
    return basePrice + tick * tickSize;
}
function getNearestTickPrice(price) {
    const tickSize = getTickSize(price);
    return Math.round(price / tickSize) * tickSize;
}
function tag(tag) {
    return (0, rxjs_1.pipe)((0, operators_1.map)((v) => (Object.assign(Object.assign({}, v), { tag: tag instanceof Object ? Object.assign(Object.assign({}, (v.tag instanceof Object ? v.tag : {})), tag) : tag }))));
}
;
/**
 * Mitt: Tiny (~200b) functional event emitter / pubsub.
 * @name mitt
 * @returns {Mitt}
 */
function mitt(all) {
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
        on(type, handler) {
            const handlers = all.get(type);
            if (handlers) {
                handlers.push(handler);
            }
            else {
                all.set(type, [handler]);
            }
        },
        /**
         * Remove an event handler for the given type.
         * If `handler` is omitted, all handlers of the given type are removed.
         * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
         * @param {Function} [handler] Handler function to remove
         * @memberOf mitt
         */
        off(type, handler) {
            const handlers = all.get(type);
            if (handlers) {
                if (handler) {
                    handlers.splice(handlers.indexOf(handler) >>> 0, 1);
                }
                else {
                    all.set(type, []);
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
        emit(type, evt) {
            let handlers = all.get(type);
            if (handlers) {
                handlers
                    .slice()
                    .map((handler) => {
                    handler(evt);
                });
            }
            handlers = all.get('*');
            if (handlers) {
                handlers
                    .slice()
                    .map((handler) => {
                    handler(type, evt);
                });
            }
        }
    };
}
