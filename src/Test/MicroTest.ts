export default class MicroTest {
    value: any;
    meta: Record<string, any>;

    constructor(value: any, meta = {}) {
        this.value = value;
        this.meta = meta;
    }
}
