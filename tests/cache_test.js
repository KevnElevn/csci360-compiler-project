describe("cache", () => {
    describe("write", () => {
        // read test
        it("Should write to cache and read the values", () => {
            const memory = new Map();
            const cache = new Cache({ nway: 1, size: 8, k: 2, memory: memory, bits: 16 });
            const address = '0000000000000000';
            cache.write({ address: address, data: '00000000000000000000000000000001', memwrite: true });
            expect(cache.read({ address: address })).to.equal("00000000000000000000000000000001");
        });
        // This test will need to be altered when memory object is created
        // check memory.get == what I want 
        it("Should write through to memory", () => {
            const memory = new Map();
            const cache = new Cache({ nway: 1, size: 8, k: 2, memory: memory, bits: 16 });
            const address = '0000000000000000';
            cache.write({ address: address, data: '00000000000000000000000000000001', memwrite: true });
            expect(cache.read({ address: address })).to.equal(cache.memory.get(address));
        });

        // isCacheHit test
        it("Should detect cache hits", () => {
            console.log("STARTING LRU TEST");
            const memory = new Map();
            // initalize a small cache
            const cache = new Cache({ nway: 1, size: 2, k: 1, memory: memory, bits: 16 });
            // initialize two addresses that map to the same index and offset
            const address = '0000000000000000';
            // initialize different data that maps to the same set, index, and offset
            const data = '00000000000000000000000000000001';
            // write the data sequentially 
            cache.write({ address: address, data: data, memwrite: true });
            // verify that the old data is not there
            expect(cache.isCacheHit(address)).to.not.equal(-1); // original address should be replaced
        });

        // LRU replacement test
        it("Should do LRU replacement", () => {
            console.log("STARTING LRU TEST");
            const memory = new Map();
            // initalize a small cache
            const cache = new Cache({ nway: 1, size: 2, k: 1, memory: memory, bits: 16 });
            // initialize two addresses that map to the same index and offset
            const address = '0000000000000000';
            const otherAddress = '0100000000000010';
            // initialize different data that maps to the same set, index, and offset
            const data = '00000000000000000000000000000001';
            const otherData = '01000000000000000000000000000010';
            // write the data sequentially 
            cache.write({ address: address, data: data, memwrite: true });
            cache.write({ address: otherAddress, data: otherData, memwrite: true });
            // verify that the old data is not there
            expect(cache.isCacheHit(address)).to.equal(-1); // original address should be replaced
            // verify that replacing data is present
            expect(cache.read({ address: otherAddress })).to.equal( otherData );
        });
      
        /*it("should update access times", () => {
            const memory = new Map();
            const cache = new Cache({ nway: 1, size: 8, k: 2, memory: memory, bits: 16 });
            cache.write({ address: '0000000000000000', data: '00000000000000000000000000000001', memwrite: true });
            expect(cache.read({address: '0000000000000000'})).to.equal("00000000000000000000000000000001");
        });*/
    });
  });