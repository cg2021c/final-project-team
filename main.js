import * as THREE from './three/three.module.js'
import {OrbitControls} from './three/OrbitControls.js'
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

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    const tick = () =>
    {
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
    // difficultyEasy();
    // difficultyMedium();
    difficultyHard();

    addLighting();

    //drawPlane();
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
    function drawPlane(){
        //Create a plane that receives shadows (but does not cast them)
        const planeGeometry = new THREE.PlaneGeometry( 60, 30, 32, 32 );
        const planeMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } )
        const plane = new THREE.Mesh( planeGeometry, planeMaterial );
        plane.position.set(0, 14.5, -24);
        plane.receiveShadow = true;
        scene.add( plane );
    }

    function difficultyEasy(){
        let r = 2;
        let x = 10, y=27, z=-20;
        for(let j=0; j<3; j++){
            for(let i=0; i<3; i++){
                drawBall(r, x, y, z);
                x-=10;
            }
            y-=8;
            x=10;
        }
    }
    function difficultyMedium(){
        let r = 1.5;
        let x = 12.5, y=27, z=-20;
        for(let j=0; j<4; j++){
            for(let i=0; i<4; i++){
                drawBall(r, x, y, z);
                x-=8;
            }
            y-=5;
            x=12.5;
        }
    }
    function difficultyHard(){
        let r = 1;
        let x = 13, y=27, z=-20;
        for(let j=0; j<5; j++){
            for(let i=0; i<5; i++){
                drawBall(r, x, y, z);
                x-=6;
            }
            y-=4;
            x=13;
        }
    }
}

init();