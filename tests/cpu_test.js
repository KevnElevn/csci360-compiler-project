describe("cpu", () => {
  describe("mov", () => {
    describe("movImmediate", () => {
      it("can move 1337 into ecx", () => {
        const opcode = "11000110";
        const register = "00000010";
        const immediate = "0000010100111001";
        const instruction = `${opcode}${register}${immediate}`;
        const labelTable = {0: 'main()'};
        const computer = new Computer({
          labelTable: labelTable,
          nway: 1,
          size: 4,
          k: 2,
        });
        computer.cpu.execute(instruction);

        expect(computer.cpu.getState()["registers"]["ecx"]).to.equal(1337);
      });
    });

    describe("movRegisterToMemory", () => {
      it("can move eax to memory, then memory to ebx", () => {
        //reg to mem
        const opcode = "1000100111110000";
        const register = "0000";
        const memory = intToNNibbles(222,3);
        const instruction = `${opcode}${memory}${register}`;
        const labelTable = {0: 'main()'};
        const computer = new Computer({
          labelTable: labelTable,
          nway: 1,
          size: 4,
          k: 2,
        });
        computer.virtualMemory.allocateStack(0);
        computer.cpu.registers["eax"] = 1337;
        computer.cpu.execute(instruction);
        //console.log(computer.cpu.registers["ebx"]);
        //mem to reg
        const opcode2 = "1000101100001111";
        const register2 = "0001";
        const memory2 = intToNNibbles(222,3);
        const instruction2 = `${opcode2}${register2}${memory2}`;
        computer.cpu.execute(instruction2);
        //console.log(computer.cpu.registers["ebx"]);

        expect(computer.cpu.registers["ebx"]).to.equal(1337)
      });
    });
  });

  describe("add", () => {
    describe("addImmediate", () => {
      it("can add 3 to ebx", () => {
        const opcode = "00000101";
        const register = "00000001";
        const immediate = intToNBytes(3, 2);
        const instruction = `${opcode}${register}${immediate}`;
        const labelTable = {0: 'main()'};
        const computer = new Computer({
          labelTable: labelTable,
          nway: 1,
          size: 4,
          k: 2,
        });

        computer.cpu.registers["ebx"] = 7;
        computer.cpu.execute(instruction);

        expect(computer.cpu.getState()["registers"]["ebx"]).to.equal(10);
      });
    });

    describe("addRegisters", () => {
      it("can add eax and ebx", () => {
        const opcode = "0000000100000000";
        const registerA = "00000000";
        const registerB = "00000001";
        const instruction = `${opcode}${registerA}${registerB}`;
        const labelTable = {0: 'main()'};
        const computer = new Computer({
          labelTable: labelTable,
          nway: 1,
          size: 4,
          k: 2,
        });
        computer.cpu.registers["eax"] = 100;
        computer.cpu.registers["ebx"] = 36;
        computer.cpu.execute(instruction);

        expect(computer.cpu.getState()["registers"]["eax"]).to.equal(136);
      });
    })
  });
});
