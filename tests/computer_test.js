describe("computer", () => {
  it("runs a basic program", () => {
    const tokens = tokenize("int main() { int foo = 3; return foo; }");
    const {parseTree, output} = compile(tokens);
    const LabelTable = {}
    const allInstructions = parseAss(output,LabelTable); console.log(allInstructions);
    const machineCodeStorage = translateInstructions(allInstructions, LabelTable).join("");
    const c = new Computer({
      labelTable: LabelTable,
      nway: 1,
      size: 4,
      k: 2,
    });

    c.loadProgram(machineCodeStorage); console.log(c.cpu.registers['pc'], "PC");
    c.step();
    c.step();
    c.step();
    c.step();
    c.step();
    c.step();
    c.step();
    c.step();
    c.step();
    c.step();
  });

  it("runs the max finding program", () => {
    const code = `int max(int a[5]) {
          int max = 0;

          for (int i=0; i<5; i++) {
            if (max < a[i]) {
              max = a[i];
            }
          }

          return max;
        }

        int main() {
          int a[3] = {1, 2, 3};
          int m = 0;
          m = max(a);
        }`

    const tokens = tokenize(code);
    const {parseTree, output} = compile(tokens);
    const labelTable = {}
    const allInstructions = parseAss(output, labelTable);
    const machineCodeStorage = translateInstructions(allInstructions, labelTable).join("");
    const c = new Computer({
      labelTable: labelTable,
      nway: 1,
      size: 4,
      k: 2,
    });

    console.log(machineCodeStorage)
    c.loadProgram(machineCodeStorage);
    c.step();
    c.step();
    c.step();
    c.step();
    c.step();
    c.step();
  });
});
