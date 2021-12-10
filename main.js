
function init(){
    // Canvas
    const canvas = document.querySelector('canvas.webgl')

    // Scene
    const scene = new THREE.Scene()
    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 0
    camera.position.y = 19
    camera.position.z = 22
    scene.add(camera)

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    // const controls = new THREE.OrbitControls(camera, canvas);
    // controls.enableDamping = true;
    
    window.addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    // Add mouse controls
    const controls = new THREE.PointerLockControls( camera, renderer.domElement );
    document.body.addEventListener( 'click', function () {

        controls.lock();

    } );
    scene.add( controls.getObject() );

    // Add crosshair
    createCrosshair(camera);

    // Add Raycaster
    let hovered;
    let selected;
    const raycaster = new THREE.Raycaster();
    

    let mesh = [];
    let newPoints;
    let balls = [];

    var width;
    var speed;
    var index = 0;
    var lineIndex = 0;
    var counter=0;
    // difficultyEasy();
    difficultyMedium();
    // difficultyHard();
    const tick = () =>
    {
        // console.log(mouse);
        animateLine();
        hover();
        renderer.render(scene, camera)
        // controls.update();
        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }
    tick()
    // ground
    addWall(60, 1, 50, 0, 0, 0);
    // far box
    addWall(60, 7, 10, 0, 4, -20);
    // far wall
    addWall(60, 30, 1, 0, 14.5, -25);
    // roof
    addWall(60, 1, 25, 0, 30, -13);
    // left wall
    addWall(1, 30, 50, -29.5, 14.5, -0);
    // right wall
    addWall(1, 30, 50, 29.5, 14.5, -0);

    addLighting();
    function addWall(w, h, d, x, y, z){
        const geometry = new THREE.BoxGeometry( w, h, d );
        const material = new THREE.MeshPhongMaterial( {color: 0x808080} );
        const cube = new THREE.Mesh( geometry, material );
        cube.receiveShadow = true;
        cube.position.set(x, y, z);
        scene.add( cube );
    }
    function drawBall(r, x, y, z){
        const geometry = new THREE.SphereGeometry( r, 32, 10 );
        const material = new THREE.MeshPhongMaterial( { color: 0x000000 } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.set(x, y, z);
        sphere.castShadow = true;
        sphere.receiveShadow = false; //default
        sphere.name = "balls";
        balls.push(sphere);
        scene.add( sphere );
    }
    
    function addLighting(){
        const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0x808080, 1);
        hemisphereLight.position.set(0, 32, 15);
        const directionalLight = new THREE.DirectionalLight( 0xffffff, 1, 100 );
        directionalLight.position.set(0, 1, 1);
        directionalLight.castShadow = true;
        scene.add( directionalLight );
        scene.add(hemisphereLight);
        directionalLight.shadow.mapSize.width = 512;
        directionalLight.shadow.mapSize.height = 512;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
    }

    function drawLine(pointStart, pointEnd){
        newPoints = [];
        let changeX = 0;
        let changeY = 0;
        //console.log(points)
        changeX = (pointEnd[0]-pointStart[0])/100; 
        changeY = (pointEnd[1] - pointStart[1])/100;

        let newX = pointStart[0];
        let newY = pointStart[1];
        for(let j=0; j<100; j++){
            newPoints.push([newX, newY, pointStart[2]]);
            newX+=changeX;
            newY+=changeY;
        }
        addLine();
    }
    function addLine(){
        let line = new MeshLine();
        line.setPoints(newPoints.flat());
        var material = new MeshLineMaterial({ color: new THREE.Color(0x0000FF), lineWidth: width, dashArray:10, dashRatio:0.7, dashOffset: 0});
        material.transparent = true;
        mesh[index] = new THREE.Mesh(line, material);
        scene.add(mesh[index++]);
    }
    function animateLine(){
        if(lineIndex > mesh.length-1)return;
        let offset = mesh[lineIndex].material.uniforms.dashOffset.value;
        mesh[lineIndex].material.uniforms.dashOffset.value -= speed;
        if(offset < -1){
            if(counter>2)counter=0;
            var lineColor = [new THREE.Color( 0xff0000 ),new THREE.Color( 0x00FF00 ) ,new THREE.Color( 0x0000FF ) ];
            lineIndex++;
            if(lineIndex < mesh.length)mesh[lineIndex].material.uniforms.color.value = lineColor[counter++];
        }
    }
    function createCrosshair(camera) {
        const map = new THREE.TextureLoader().load('./assets/crosshair.png');
        const material = new THREE.SpriteMaterial({ map: map, transparent: true, depthTest: false });
    
        let sprite = new THREE.Sprite(material);
        sprite.scale.set(0.2, 0.2, 1);
        sprite.position.z = -2.0;
        camera.add(sprite);
        sprite.name = "crosshair";
        return sprite;
    }
    function hover(){
        raycaster.setFromCamera(new THREE.Vector2(), camera);
        raycaster.ray.origin.copy(controls.getObject().position);
        const intersects = raycaster.intersectObjects(balls, false);
        if(intersects.length > 0){
            if(hovered != intersects[0].object){
                if(hovered){
                    hovered.material.emissive.setHex(hovered.currentHex);
                }
    
                hovered = intersects[0].object;
                hovered.currentHex = hovered.material.emissive.getHex();
                hovered.material.emissive.setHex(0xFFFF00);
            }
        }
        else{
            if(hovered){
                hovered.material.emissive.setHex(hovered.currentHex);
            }
    
            hovered = null;
        }
    }
    function difficultyEasy(){
        speed = 0.03;
        width = 1;
        let points = [];
        let r = 2;
        let x = 10, y=27, z=-20;
        for(let j=0; j<3; j++){
            for(let i=0; i<3; i++){
                points.push([x, y, z]);
                drawBall(r, x, y, z);
                x-=10;
                z+=0.05;
            }
            y-=8;
            x=10;
        }
       shuffle(points);
        for(let i=0; i<8; i++){
            drawLine(points[i], points[i+1]);
        }
    }
    function difficultyMedium(){
        speed = 0.015;
        width = 0.5;
        let points = [];
        let r = 1.5;
        let x = 12.5, y=27, z=-20;
        for(let j=0; j<4; j++){
            for(let i=0; i<4; i++){
                points.push([x, y, z]);
                drawBall(r, x, y, z);
                x-=8;
                z+=0.1;
            }
            y-=6;
            x=12.5;
        }
        shuffle(points);
        for(let i=0; i<15; i++){
            drawLine(points[i], points[i+1]);
        }
    }
    function difficultyHard(){
        speed = 0.01;
        width = 0.3;
        let points = [];
        let r = 1;
        let x = 13, y=27, z=-20;
        for(let j=0; j<5; j++){
            for(let i=0; i<5; i++){
                points.push([x, y, z]);
                drawBall(r, x, y, z);
                x-=6;
                z+=0.03;
            }
            y-=4.5;
            x=13;
        }
        shuffle(points);
        for(let i=0; i<24; i++){
            drawLine(points[i], points[i+1]);
        }
    }
    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }
}

init();