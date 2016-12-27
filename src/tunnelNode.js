(function(global) {
  class tunnelNode extends NIN.Node {
    constructor(id, options) {
      super(id, {
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

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;

      const ctx = canvas.getContext('2d');
      for (let i=0; i<256; i+=4) {
        ctx.fillStyle = 'white';
        ctx.fillRect(i, 0, 2, 256);
        ctx.fillStyle = 'pink';
        ctx.fillRect(i + 2, 0, 2, 256);
      }

      this.texture = new THREE.CanvasTexture(canvas);
      this.texture.wrapS = THREE.RepeatWrapping;
      this.texture.wrapT = THREE.RepeatWrapping;
      const geometry = new THREE.CylinderGeometry(20, 20, 1000, 32, 1, true);
      const material = new THREE.MeshBasicMaterial({
        map: this.texture
      });
      material.side = THREE.BackSide;

      this.cylinder = new THREE.Mesh(geometry, material);
      this.cylinder.rotation.x = Math.PI / 2;
      this.scene.add(this.cylinder);

      var light = new THREE.PointLight( 0xffffff, 1, 100 );
      light.position.set( -50, -50, -50 );
      this.scene.add(light);

      var pointLight = new THREE.PointLight(0xFFFFFF);
      pointLight.position.x = 10;
      pointLight.position.y = 50;
      pointLight.position.z = 130;
      this.scene.add(pointLight);

      this.camera.position.z = 0;
      this.camera.lookAt(new THREE.Vector3(0, 0, 10));
    }

    update(frame) {
      this.cylinder.rotation.z = Math.cos(frame / 60) * 0.2;
      if (BEAT && BEAN % 2 == 1) {
        this.texture.offset.x = (frame / 300) % 1.0;
        this.texture.needsUpdate   = true;
      }
    }

    render(renderer) {
      renderer.render(this.scene, this.camera, this.renderTarget, true);
      this.outputs.render.setValue(this.renderTarget.texture);
    }
  }

  global.tunnelNode = tunnelNode;
})(this);
