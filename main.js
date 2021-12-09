// import * as THREE from "./three/three.module.js"
// import {OrbitControls} from "./three/OrbitControls.js"
// import {MeshLine} from "./three/THREE.MeshLine.js"
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

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 0
    camera.position.y = 5
    camera.position.z = 30
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

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    
    let mesh;
    let newPoints = [];

    difficultyEasy();
    addLine();
    const tick = () =>
    {
        animateLine();
        console.log(mesh.material.uniforms.dashOffset.value);
        renderer.render(scene, camera)
        controls.update();
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

    // Draw the balls
    
    // difficultyMedium();
    // difficultyHard();

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
        const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.set(x, y, z);
        sphere.castShadow = true;
        sphere.receiveShadow = false; //default
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
        let changeX = 0;
        let changeY = 0;
        //console.log(points)
        changeX = (pointEnd[0]-pointStart[0])/20; 
        changeY = (pointEnd[1] - pointStart[1])/20;

        let newX = pointStart[0];
        let newY = pointStart[1];
        for(let j=0; j<20; j++){
            newPoints.push([newX, newY, pointStart[2]]);
            newX+=changeX;
            newY+=changeY;
        }
        
    }
    function addLine(){
        let line = new MeshLine();
        line.setPoints(newPoints.flat());
        var material = new MeshLineMaterial({ color: new THREE.Color(0x0000FF), lineWidth: 1, dashArray:10, dashRatio:0.1, dashOffset: 0});
        material.transparent = true;
        mesh = new THREE.Mesh(line, material);
        scene.add(mesh);
    }
    function animateLine(){
        let offset = mesh.material.uniforms.dashOffset.value;
        if(offset > -1)mesh.material.uniforms.dashOffset.value -=0.005;
    }
    function difficultyEasy(){
        let points = [];
        let r = 2;
        let x = 10, y=27, z=-20;
        for(let j=0; j<3; j++){
            for(let i=0; i<3; i++){
                points.push([x, y, z]);
                drawBall(r, x, y, z);
                x-=10;
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
        let points = [];
        let r = 1.5;
        let x = 12.5, y=27, z=-20;
        for(let j=0; j<4; j++){
            for(let i=0; i<4; i++){
                points.push([x, y, z]);
                drawBall(r, x, y, z);
                x-=8;
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
        let points = [];
        let r = 1;
        let x = 13, y=27, z=-20;
        for(let j=0; j<5; j++){
            for(let i=0; i<5; i++){
                points.push([x, y, z]);
                drawBall(r, x, y, z);
                x-=6;
            }
            y-=4;
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