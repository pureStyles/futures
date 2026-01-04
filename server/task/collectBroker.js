/**
 * 收集期货
 */
const fs = require("fs").promises;
const path = require('path');
const typicalBroker = require('../config/typicalBroker');


class Broker {
    constructor() {
        this.outPath = path.join(process.cwd(), 'app', 'src/config/broker.js');
    }

    async writeFile(json) {

        fs.writeFile(
            this.outPath,
            json,
            'utf-8'
        )
    }

    async execute() {
        const result = new Set();
        for(const brokers of Object.values(typicalBroker)) {
            for(const broker of brokers) {
                result.add(broker);
            }
        }
        const jsContent = `export const BROKERS = ${JSON.stringify(Array.from(result), null, 4)}`
        await this.writeFile(jsContent);
    }
}

new Broker().execute()