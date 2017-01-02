(function(global) {
  class Dweet {
    constructor(dweetFn) {
      this.dweetFn = dweetFn;

      this.canvas = document.createElement('canvas');
      this.canvas.width = 2048;
      this.canvas.height = 1024;

      this.ctx = this.canvas.getContext('2d');

      this.texture = new THREE.CanvasTexture(this.canvas);
      this.texture.wrapS = THREE.RepeatWrapping;
      this.texture.wrapT = THREE.RepeatWrapping;
      this.texture.repeat.set(15, 20);

      this.material = new THREE.MeshBasicMaterial({
        map: this.texture,
        side: THREE.DoubleSide
        //roughness: 0.8
      });
    }

    update(t) {
      this.dweetFn(
        t,
        Math.sin,
        Math.cos,
        Math.tan,
        (r, g, b, a) => {
          a = a === undefined ? 1 : a;
          return "rgba("+(r|0)+","+(g|0)+","+(b|0)+","+a+")";
        },
        this.canvas,
        this.ctx);

      this.texture.needsUpdate = true;
    }
  }

  class spaceOddyseyNode extends NIN.Node {
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

      this.dweets = [
        // Regular green swirl
        new Dweet((t, S, C, T, R, c, x) => {
          x.fillStyle='green';
          let s;
          for(let i=24;i--;)for(let j=24;j--;)t+=1.7,s=S(t)*((j+i&1)*2-1),x.setTransform(C(t),s,-s,C(t),i*99,j%12*99),x.fillRect(-9,-49,19,99);
        }),

        // Green Lines
        new Dweet((t, S, C, T, R, c, x) => {
          x.fillStyle = 'black';
          x.fillRect(0, 0, c.width, c.height);
          x.fillStyle = 'green';
          for(let i=0;i<9;i++){
            x.fillRect(400+i*100+S(t)*300,400,50,200)
          }
        }),

        // Red swirls
        new Dweet((t, S, C, T, R, c, x) => {
          let r, w, h, p, q;
          x.strokeStyle = 'red';
          t++;x.beginPath();r=128*t;w=960;h=540;p=24*Math.PI*t+t;q=p/60%t;x.moveTo(r*C(p-q)+w,r*S(p-q)+h);x.lineTo(r*C(p)+w,r*S(p)+h);x.stroke();
        }),

        // Filled Heart
        new Dweet((t, S, C, T, R, c, x) => {
          let X=0;
          x.fillStyle=R(249,183,227,.01);X=S(t);x.lineTo(960+512*X*X*X,480-32*(13*C(t)-5*C(2*t)-2*C(3*t)-C(4*t)));x.fill()
        }),

        // Heart outline
        new Dweet((t, S, C, T, R, c, x) => {
          let r=0;
          let X=0;
          x.fillStyle=R(247,160,211,r=1/(1+.02*t));X=S(t);x.fillRect(960+512*X*X*X*r,480-32*r*(13*C(t)-5*C(2*t)-2*C(3*t)-C(4*t)),15*r,15*r);
        }),

        // Sigves 3Deffect
        new Dweet((t, S, C, T, R, c, x) => {
          let F, W, i, n, m;
          (F=Z=>{for(x.fillStyle=R(W=1/Z*4e3,W/2,W/4),i=Z*Z*2;n=i%Z,m=i/Z|0,i--;n%2^m%2&&x.fillRect((n-t%2-1)*W,(S(t)+m-1)*W,W,W));Z&&F(Z-6)})(36);
        }),

        // Gray Noise
        new Dweet((t, S, C, T, R, c, x) => {
          let a=0;
          if(!t)a=1;for(let i=0;i<1920;i+=1){x.fillStyle=(t|0)%2?"#FFF":"#000",x.fillRect(i*4,C(a)*t*100&1023,8,8),a+=C(t*i*a)}
        })
      ];


      this.leftPlane = new THREE.Mesh(new THREE.PlaneGeometry(600, 300),
                                 this.dweets[1].material);
      this.leftPlane.rotation.y = Math.PI / 2;

      this.leftPlane.position.x = -15;
      this.scene.add(this.leftPlane);

      this.rightPane = new THREE.Mesh(new THREE.PlaneGeometry(600, 300),
                                 this.dweets[1].material);
      this.rightPane.rotation.y = Math.PI / 2;

      this.rightPane.position.x = 15;
      this.scene.add(this.rightPane);



      var light = new THREE.PointLight( 0xeeeeee, 1 );
      light.position.set(0, 0, 0);
      this.scene.add(light);

      this.camera.position.z = 100;
    }

    update(frame) {
      const idx = (BEAN / (16 * 4)) | 0;
      let d = this.dweets[idx % this.dweets.length];

      this.leftPlane.material = d.material;
      this.rightPane.material = d.material;

      d.update(frame / 60);
      d.texture.offset.x = ((frame * Math.log(Math.log(frame / 20))) / 60);
    }

    render(renderer) {
      renderer.render(this.scene, this.camera, this.renderTarget, true);
      this.outputs.render.setValue(this.renderTarget.texture);
    }
  }

  global.spaceOddyseyNode = spaceOddyseyNode;
})(this);
