(function(global) {
  class Floor {
    constructor(layers, padX=0, padY=0, width=5) {
      this.mesh = new THREE.Object3D();
      this.tileLayers = [];

      for (var i=0; i<layers; i++) {
        this.tileLayers.push([]);
      }

      this.colors = ["#FD1D38", "#4D9CF0", "#DCB367"]

      var widthX = layers * 2 + padX;
      var widthY = layers * 2 + padY;

      for (var w=0; w<widthX; w++) {
        for (var d=0; d<widthY; d++) {
          var tile = new THREE.Mesh(
              new THREE.BoxGeometry(width, 0.1, width),
              new THREE.MeshBasicMaterial({ color: 'black' }));

          tile.position.set(w * (width + 1), 0, d * (width + 1));

          this.mesh.add(tile);

          var XIndex = 0;
          if (w < layers + padX) {
            XIndex = Math.min(w, layers);
          } else {
            XIndex = widthX - w - 1;
          }

          var YIndex = 0;
          if (d < layers + padY) {
            YIndex = Math.min(d, layers);
          } else {
            YIndex = widthY - d - 1;
          }

          var layerIndex = Math.min(XIndex, YIndex);
          this.tileLayers[layerIndex].push(tile);
        }
      }
    }

    clear() {
      for (let layer of this.tileLayers) {
        for (let tile of layer) {
          tile.material.color.setStyle("black");
        }
      }
    }

    set(layerIdx, active) {
      for (let tile of this.tileLayers[layerIdx]) {
        tile.material.color.setStyle(
            active ? this.colors[layerIdx % this.colors.length] : 'black');
      }
    }
  }

  class DiscoFloorNode extends NIN.Node {
    constructor(id, options) {
      super(id, {
        inputs: {
          camera: new NIN.CameraInput()
        },
        outputs: {
          render: new NIN.TextureOutput()
        }
      });

      this.scene = new THREE.Scene();
      this.renderTarget = new THREE.WebGLRenderTarget(640, 360, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
      });

      this.camera = new THREE.PerspectiveCamera(45, 16 / 9, 1, 10000);

      this.floors = [];
      for (let i=0; i<2; i++) {
        for (let j=0; j<2; j++) {
          let floor = new Floor(4, 1);
          floor.mesh.position.x = 57 * i;
          floor.mesh.position.z = 50 * j;

          this.floors.push(floor);
          this.scene.add(floor.mesh);
        }
      }

      //var light = new THREE.PointLight( 0xffffff, 1, 100 );
      //light.position.set( -50, -50, -50 );
      //this.scene.add(light);

      //var pointLight = new THREE.PointLight(0xFFFFFF);
      //pointLight.position.x = 10;
      //pointLight.position.y = 50;
      //pointLight.position.z = 130;
      //this.scene.add(pointLight);
    }

    update(frame) {
      if (BEAT) {
        this.floors.forEach(f => f.set(2, (BEAN % 16 < 8)));
        this.floors.forEach(f => f.set(1, ((BEAN + 2) % 8 < 2)));
        this.floors.forEach(f => f.set(0, (BEAN % 8 < 4)));
        this.floors.forEach(f => f.set(3, (BEAN % 8 < 4)));
      }
    }

    render(renderer) {
      renderer.render(this.scene, this.inputs.camera.getValue(), this.renderTarget, true);
      this.outputs.render.setValue(this.renderTarget.texture);
    }
  }

  global.DiscoFloorNode = DiscoFloorNode;
})(this);
