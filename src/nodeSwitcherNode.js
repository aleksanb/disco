(function(global) {
  class nodeSwitcherNode extends NIN.Node {
    constructor(id, options) {
      super(id, {
        inputs: {
          A: new NIN.TextureInput(),
          B: new NIN.TextureInput()
        },
        outputs: {
          selected: new NIN.TextureOutput()
        }
      });
    }

    update(frame) {
      if (frame < 888) {
        this.outputs.selected.setValue(this.inputs.A.getValue());
        this.inputs.A.enabled = true;
        this.inputs.B.enabled = false;
      } else {
        this.outputs.selected.setValue(this.inputs.B.getValue());
        this.inputs.A.enabled = false;
        this.inputs.B.enabled = true;
      }
    }
  }

  global.nodeSwitcherNode = nodeSwitcherNode;
})(this);
