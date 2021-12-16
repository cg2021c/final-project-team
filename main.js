
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
    camera.position.z = 35
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
    window.addEventListener('click', selectObject);

    const blocker = document.getElementById( 'blocker' );
    const gameoverBlocker = document.getElementById( 'gameoverBlocker' );
    const instructions = document.getElementById( 'instructions' );
    const gameover = document.getElementById( 'gameover' );
    const mainmenu = document.getElementById( 'mainmenu' );
    const easy = document.getElementById( 'easy' );
    const medium = document.getElementById( 'medium' );
    const hard = document.getElementById( 'hard' );
    const scores = document.getElementById( 'scores' );
    const scoresvalue = document.getElementById( 'scoresvalue' );
    const timer = document.getElementById( 'timer' );
    const finalscore = document.getElementById( 'finalscore' );
    const finaltime = document.getElementById( 'finaltime' );
    const tryagain = document.getElementById( 'tryagain' );
    const logo = document.getElementById( 'logo' );
    const audio = document.getElementById( 'audioplayer' );

    // Add mouse controls
    const controls = new THREE.PointerLockControls( camera, renderer.domElement );
    var pause = true;
    var inGame = false;
    var difficulty=0;
    let points = [];
    let mesh = [];
    let mesh2 = [];
    var score = 0;
    var time = 0;
    scores.style.display = 'none';
    blocker.style.display = 'block';
    scoresvalue.innerText = score;
    timer.innerText = format(time);
    gameover.style.display = 'none';
    gameoverBlocker.style.display = 'none';
    easy.addEventListener('click', function (){
        inGame = true;
        blocker.style.display = 'none';
        logo.style.display = 'none';
        mainmenu.style.display = 'none';
        scores.style.display = '';
        audio.play();
        difficulty = 0;
        timerf();
        difficultyEasy();
    });
    medium.addEventListener('click', function (){
        inGame = true;
        blocker.style.display = 'none';
        logo.style.display = 'none';
        mainmenu.style.display = 'none';
        scores.style.display = '';
        audio.play();
        difficulty = 1;
        timerf()
        difficultyMedium();
    });
    hard.addEventListener('click', function (){
        inGame = true;
        blocker.style.display = 'none';
        logo.style.display = 'none';
        mainmenu.style.display = 'none';
        scores.style.display = '';
        audio.play();
        difficulty = 2;
        timerf()
        difficultyHard();
    });
    tryagain.addEventListener('click', function (){
        inGame = false;
        window.location.reload(1);
    });
    document.body.addEventListener( 'click', function () {
        if(!inGame) return;
        controls.lock();
    } );
    controls.addEventListener( 'lock', function () {

        pause=false;
    } );
    scene.add( controls.getObject() );

    // Add crosshair
    createCrosshair(camera);

    // Add Raycaster
    let hovered;
    let selected;
    const raycaster = new THREE.Raycaster();
    var done = false;
    var canSelect = false;

    let newPoints;
    let objects = [];
    let visited = [];
    var start=null, end=null;
    var addZ=0;

    var width;
    var speed;
    var index = 0;
    var lineIndex = 0;
    var counter=0;
    var lineColor = [new THREE.Color( 0xff0000 ),new THREE.Color( 0x00FF00 ) ,new THREE.Color( 0x0000FF ) ];

    var tick = () =>
    {
        if(!pause){
            if(done){
                done = false;
                setTimeout(()=>{
                    disposeLine(mesh);
                    index = 0;
                    canSelect = true;
                }, 3000)
            }
            animateLine();
            hover();
        }
        renderer.render(scene, camera)

        window.requestAnimationFrame(tick)
    }
    tick()

    let loader = new THREE.CubeTextureLoader();
    let skybox = loader.load([
        './assets/barren_ft.jpg',
        './assets/barren_bk.jpg',
        './assets/barren_up.jpg',
        './assets/barren_dn.jpg',
        './assets/barren_rt.jpg',
        './assets/barren_lf.jpg',
    ]);
    scene.background = skybox;
    

    // ground
    addWall(60, 1, 100, 0, 0, 0, "ground");
    // far box
    addWall(60, 7, 10, 0, 4, -20, "far_box");
    // front wall
    addWall(65, 30, 1, 0, 14.5, -25, "far_wall");
    // back wall
    addWall(60, 30, 1, 0, 14.5, 50, "far_wall");
    // roof
    addWall(62, 1, 50, 0, 29, -20, "roof");
    // left wall1
    addWall(1, 30, 35, -29.5, 14.5, -5, "left_wall");
    // left wall2
    addWall(1, 30, 15, -29.5, 14.5, 45, "left_wall");
    // left walltop
    addWall(1, 10, 25, -29.5, 24.5, 25, "left_wall");
    // left wallbottom
    addWall(1, 10, 25, -29.5, 4, 25, "left_wall");
    // right wall1
    addWall(1, 30, 35, 29.5, 14.5, -5, "left_wall");
    // right wall2
    addWall(1, 30, 15, 29.5, 14.5, 45, "left_wall");
    // right walltop
    addWall(1, 10, 25, 29.5, 24.5, 25, "left_wall");
    // right wallbottom
    addWall(1, 10, 25, 29.5, 4, 25, "left_wall");



    addLighting();
    function addWall(w, h, d, x, y, z, types){
        let wall_texture;
        if (types == "ground") {
            wall_texture = new THREE.TextureLoader().load( './assets/white-wall.png' );
        } 
        else if (types == "far_box") {
            wall_texture = new THREE.TextureLoader().load( './assets/red-tile.png' );
        }
        else if (types == "far_wall") {
            wall_texture = new THREE.TextureLoader().load( './assets/white-wall.png' );
        }
        else if (types == "roof") {
            wall_texture = new THREE.TextureLoader().load( './assets/white-wall.png' );
        }
        else if (types == "left_wall") {
            wall_texture = new THREE.TextureLoader().load( './assets/white-wall.png' );
        }
        else if (types == "right_wall") {
            wall_texture = new THREE.TextureLoader().load( './assets/white-wall.png' );
        }
        
        const geometry = new THREE.BoxGeometry( w, h, d );

        // immediately use the texture for material creation
        const material = new THREE.MeshBasicMaterial( { map: wall_texture } );
        // const material = new THREE.MeshPhongMaterial( {color: 0x4ae874} );
        const cube = new THREE.Mesh( geometry, material );
        cube.receiveShadow = true;
        cube.position.set(x, y, z);
        scene.add( cube );
    }

    // ball 
    const BaseBallMap = new THREE.TextureLoader().load("./assets/basecolor-ball-map.jpg");
    const NormalBallMap = new THREE.TextureLoader().load("./assets/normal-ball-map.jpg");
    const HeightBallMap = new THREE.TextureLoader().load("./assets/height-ball-map.png");
    const AmbientBallMap = new THREE.TextureLoader().load("./assets/ambient-ball-map.jpg");
    const RoughnessBallMap = new THREE.TextureLoader().load("./assets/roughness-ball-map.jpg");

    const BallMaterial = {
        map: BaseBallMap,
        normalMap: NormalBallMap,
        displacementMap: HeightBallMap,
        displacementScale: 5,
        roughnessMap: RoughnessBallMap,
        roughness: 0.02,
        aoMap: AmbientBallMap,
        aoMapIntensity: 0.9,
        metalness: 0.2,
        color: 0xd4af37,
    };

    function drawBall(r, x, y, z){
        const geometry = new THREE.SphereGeometry( r, 32, 10 );
        const material = new THREE.MeshPhysicalMaterial(BallMaterial);
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.set(x, y, z);
        sphere.castShadow = true;
        sphere.receiveShadow = true; //default
        sphere.name = "balls";
        objects.push(sphere);
        scene.add( sphere );
    }

    // box 
    const BaseBoxMap = new THREE.TextureLoader().load("./assets/basecolor-box-map.jpg");
    const NormalBoxMap = new THREE.TextureLoader().load("./assets/normal-box-map.jpg");
    const HeightBoxMap = new THREE.TextureLoader().load("./assets/height-box-map.png");
    const AmbientBoxMap = new THREE.TextureLoader().load("./assets/ambient-box-map.jpg");
    const RoughnessBoxMap = new THREE.TextureLoader().load("./assets/roughness-box-map.jpg");
    const MetallicBoxMap = new THREE.TextureLoader().load("./assets/metallic-box-map.jpg");

    const BoxMaterial = {
        map: BaseBoxMap,
        normalMap: NormalBoxMap,
        displacementMap: HeightBoxMap,
        displacementScale: 0,
        roughnessMap: RoughnessBoxMap,
        roughness: 0.1,
        aoMap: AmbientBoxMap,
        aoMapIntensity: 0.3,
        metalnessMap: MetallicBoxMap,
        metalness: 0.1,
        color: 0xd4af37,
    };

    function drawSquare(w, x, y, z){
        const geometry = new THREE.BoxGeometry( w, w, w );
        const material = new THREE.MeshPhysicalMaterial(BoxMaterial);
        const square = new THREE.Mesh( geometry, material );
        square.position.set(x, y, z);
        square.castShadow = true;
        square.receiveShadow = true; //default
        square.name = "squares";
        objects.push(square);
        scene.add( square );
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

    function drawLine(x1, x2, y1, y2, z1, dr, da, mesh){
        newPoints = [];
        let changeX = 0;
        let changeY = 0;
        changeX = (x2-x1)/100; 
        changeY = (y2 - y1)/100;

        let newX = x1;
        let newY = y1;
        let newZ = z1;
        for(let j=0; j<100; j++){
            newPoints.push([newX, newY, newZ]);
            newX+=changeX;
            newY+=changeY;
        }
        addLine(dr, da, mesh);
    }
    function addLine(dr, da, mesh){
        if(counter>2)counter = 0;
        let line = new MeshLine();
        line.setPoints(newPoints.flat());
        var material = new MeshLineMaterial({ color: lineColor[counter++], lineWidth: width, dashArray:da, dashRatio:dr, dashOffset: 0});
        material.transparent = true;
        mesh[index] = new THREE.Mesh(line, material);
        scene.add(mesh[index++]);
    }

    function disposeLine(mesh){
        for(let i=0; i<mesh.length; i++){
            scene.remove(mesh[i]);
        }
    }
    function animateLine(){
        if(lineIndex > mesh.length-1){
            return;
        }
        let offset = mesh[lineIndex].material.uniforms.dashOffset.value;
        mesh[lineIndex].material.uniforms.dashOffset.value -= speed;
        if(offset < -1){
            lineIndex++;
        }
        if(lineIndex > mesh.length-1)done = true;
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
        const intersects = raycaster.intersectObjects(objects, false);
        if(!canSelect) return;
        if(intersects.length > 0){
            if(checkBall(intersects[0].object))return;
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
    function selectObject(){
        const intersects = raycaster.intersectObjects(objects, false);
        if(intersects.length == 0 || !canSelect){
            return;
        }
        if(checkBall(intersects[0].object)) return;
        visited.push(intersects[0].object);
        if(start){

            end = intersects[0].object.position;
            drawLine(start.x,end.x, start.y, end.y, start.z+addZ, 0.5, 0, mesh2);
            start = end;
            addZ+=0.03;
            if(visited.length === mesh.length + 1){
                if(checkResult())gameContinue();
                else gameOver();
            }
            return;
        }
        start = intersects[0].object.position;
    }
    function checkResult(){
        let correct = points;
        let users = visited;
        for(let i=0; i<mesh.length; i++){
             if(correct[i][0]!=users[i].position.x || correct[i][1]!=users[i].position.y )return false;
        }
        return true;
    }
    function gameOver(){
        blocker.style.display = 'none';
        finaltime.innerText=format(time)
        inGame = false;
        tick = null;
        finalscore.innerText+=score;
        gameoverBlocker.style.display = 'block';
        gameover.style.display = '';
        // blocker.style.backgroundImage = "url(./assets/GameOver-Background.png)";
        controls.unlock();
    }
    function gameContinue(){
        var newScore = 1;
        var value = 1;
        if(difficulty==1)value = 5;
        else if(difficulty==2)value = 10;
        var temp = setInterval(()=>{
            if(newScore==100)
            {
                disposeLine(mesh2);
                lineIndex = 0;
                index = 0;
                emptyArray(objects);
                emptyArray(visited);
                emptyArray(points);
                emptyArray(mesh);
                emptyArray(mesh2);
                start=null;
                end = null;
                canSelect = false;
                if(difficulty==0)difficultyEasy();
                else if(difficulty==1)difficultyMedium();
                else difficultyHard();
                clearInterval(temp);
            }
            score+=value;
            scoresvalue.innerText = score;
            newScore++;
        }, 20)
        
    }

    function format(time) {   
        // Hours, minutes and seconds
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;
    
        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }

    function timerf(){
        var timetemp = setInterval(()=>{
            if(inGame==false)
            {
                time=0;
                clearInterval(timetemp);
            }
            time++;
            timer.innerText=format(time);
        }, 1000)
    }
    function emptyArray(A){
        while(A.length>0){
            A.pop();
        }
    }
    function checkBall(object){
        for(let i=0; i<visited.length; i++){
            if(object==visited[i])return true;
        }
        return false;
    }
    function difficultyEasy(){
        speed = 0.01;
        width = 1;
        let count = 0;
        let r = 2;
        let w = 4;
        let x = 10, y=27, z=-20;
        for(let j=0; j<3; j++){
            for(let i=0; i<3; i++){
                points.push([x, y, z]);
                if(j%2==0){
                    if(i%2==0)
                        drawBall(r, x, y, z);
                    else
                        drawSquare(w, x, y, z);
                } else {
                    if(i%2==1)
                        drawBall(r, x, y, z);
                    else
                        drawSquare(w, x, y, z);
                }
                x-=10;
            }
            y-=8;
            x=10;
        }
       points = shuffle(points);
        for(let i=0; i<8; i++){
            drawLine(points[i][0],points[i+1][0], points[i][1], points[i+1][1],points[i][2] + count, 0.7, 10, mesh);
            count+=0.05;
        }
        counter = 0;
    }
    function difficultyMedium(){
        speed = 0.015;
        width = 0.5;
        let count = 0;
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
            drawLine(points[i][0],points[i+1][0], points[i][1], points[i+1][1],points[i][2]+ count, 0.7, 10, mesh);
            count+=0.03;
        }
        counter = 0;
    }
    function difficultyHard(){
        speed = 0.01;
        width = 0.3;
        let count = 0;
        let r = 1;
        let x = 13, y=27, z=-20;
        for(let j=0; j<5; j++){
            for(let i=0; i<5; i++){
                points.push([x, y, z]);
                drawBall(r, x, y, z);
                x-=6;
            }
            y-=4.5;
            x=13;
        }
        shuffle(points);
        for(let i=0; i<24; i++){
            drawLine(points[i][0],points[i+1][0], points[i][1], points[i+1][1],points[i][2]+ count, 0.7, 10, mesh);
            count+=0.03;
        }
        counter = 0;
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